<?php
// app/Modules/Stock/Controllers/StockController.php

namespace App\Modules\Stock\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Stock\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StockController extends Controller
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'clinic_id', 'supplier_id', 'category', 'status',
            'stock_status', 'search', 'expiry_filter', 'name'
        ]);

        $stocks = $this->stockService->getAllStocks($filters);

        return response()->json([
            'success' => true,
            'data' => $stocks
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|unique:stocks,code',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'category' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'supplier_id' => 'required|exists:suppliers,id',
            'clinic_id' => 'required|exists:clinics,id',
            'purchase_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'purchase_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:today',
            'current_stock' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'critical_stock_level' => 'required|integer|min:0',
            'yellow_alert_level' => 'nullable|integer|min:0',
            'red_alert_level' => 'nullable|integer|min:0',
            'track_expiry' => 'boolean',
            'track_batch' => 'boolean',
            'storage_location' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Set defaults for alert levels if not provided
            $data['yellow_alert_level'] = $data['yellow_alert_level'] ?? $data['min_stock_level'];
            $data['red_alert_level'] = $data['red_alert_level'] ?? $data['critical_stock_level'];
            $data['currency'] = $data['currency'] ?? 'TRY';
            $data['is_active'] = $data['is_active'] ?? true;
            $data['status'] = $data['is_active'] ? 'active' : 'inactive';

            $stock = $this->stockService->createStock($data);

            return response()->json([
                'success' => true,
                'message' => 'Stok başarıyla oluşturuldu',
                'data' => $stock
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        try {
            $stock = $this->stockService->getStockById($id);

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok bulunamadı'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $stock
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'sometimes|required|string|max:50',
            'category' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'purchase_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'purchase_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'min_stock_level' => 'sometimes|required|integer|min:0',
            'critical_stock_level' => 'sometimes|required|integer|min:0',
            'yellow_alert_level' => 'nullable|integer|min:0',
            'red_alert_level' => 'nullable|integer|min:0',
            'track_expiry' => 'boolean',
            'track_batch' => 'boolean',
            'storage_location' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Update status based on is_active if provided
            if (isset($data['is_active'])) {
                $data['status'] = $data['is_active'] ? 'active' : 'inactive';
            }

            $stock = $this->stockService->updateStock($id, $data);

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok bulunamadı'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Stok başarıyla güncellendi',
                'data' => $stock
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = $this->stockService->deleteStock($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok bulunamadı'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Stok başarıyla silindi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function adjustStock(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:increase,decrease',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
            'performed_by' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            $quantity = $data['type'] === 'increase' ? $data['quantity'] : -$data['quantity'];

            $result = $this->stockService->adjustStock(
                $id,
                $quantity,
                $data['reason'],
                $data['performed_by']
            );

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok düzeltmesi başarısız'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Stok başarıyla düzeltildi',
                'data' => $this->stockService->getStockById($id)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function useStock(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
            'performed_by' => 'required|string|max:255',
            'used_by' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            $notes = $data['notes'] ?? '';
            if (!empty($data['used_by'])) {
                $notes .= "\nKullanan: " . $data['used_by'];
            }
            if (!empty($data['reason'])) {
                $notes .= "\nSebep: " . $data['reason'];
            }

            $result = $this->stockService->useStock(
                $id,
                $data['quantity'],
                $data['performed_by'],
                $notes
            );

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Yetersiz stok veya stok bulunamadı'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Stok kullanımı kaydedildi',
                'data' => $this->stockService->getStockById($id)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // ✅ ENDPOINT ADLARI DÜZELTİLDİ - Frontend ile uyumlu
    public function getLowLevel(Request $request)
    {
        $clinicId = $request->query('clinic_id');
        $items = $this->stockService->getLowStockItems($clinicId);

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function getCriticalLevel(Request $request)
    {
        $clinicId = $request->query('clinic_id');
        $items = $this->stockService->getCriticalStockItems($clinicId);

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function getExpiring(Request $request)
    {
        $days = $request->query('days', 30);
        $clinicId = $request->query('clinic_id');
        $items = $this->stockService->getExpiringItems($days, $clinicId);

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    // ✅ YENİ ENDPOINT EKLENDİ - Frontend'in ihtiyaç duyduğu
    public function getStats(Request $request)
    {
        try {
            $clinicId = $request->query('clinic_id');
            $stats = $this->stockService->getStockStats($clinicId);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // eski method'ları uyumluluk için tut
    public function getLowStockItems(Request $request)
    {
        return $this->getLowLevel($request);
    }

    public function getCriticalStockItems(Request $request)
    {
        return $this->getCriticalLevel($request);
    }

    public function getExpiringItems(Request $request)
    {
        return $this->getExpiring($request);
    }
}