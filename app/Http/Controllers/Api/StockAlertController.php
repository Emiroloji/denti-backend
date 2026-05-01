<?php

// ==============================================
// 6. StockAlertController
// app/Modules/Stock/Controllers/StockAlertController.php
// ==============================================

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockAlert;
use App\Services\StockAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StockAlertController extends Controller
{
    protected $stockAlertService;

    public function __construct(StockAlertService $stockAlertService)
    {
        $this->stockAlertService = $stockAlertService;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', StockAlert::class);

        $filters = $request->only([
            'clinic_id', 'type', 'severity', 'search', 'date_from', 'date_to'
        ]);
        
        $activeOnly = $request->query('active_only', true);

        // Otomatik Senkronizasyon: Her istekte güncel veriyi sağla
        $this->stockAlertService->syncAlerts($filters['clinic_id'] ?? null);

        if ($activeOnly === 'false' || $activeOnly === false) {
            $alerts = $this->stockAlertService->getAlerts($filters);
        } else {
            $alerts = $this->stockAlertService->getActiveAlerts($filters);
        }

        return response()->json([
            'success' => true,
            'data' => $alerts
        ]);
    }

    public function sync(Request $request)
    {
        $clinicId = $request->query('clinic_id');
        $count = $this->stockAlertService->syncAlerts($clinicId);

        return response()->json([
            'success' => true,
            'message' => "{$count} ürün tarandı ve uyarılar kontrol edildi.",
            'data' => ['processed_count' => $count]
        ]);
    }

    public function show($id)
    {
        $alert = $this->stockAlertService->getAlertById($id);

        if (!$alert) {
            return response()->json([
                'success' => false,
                'message' => 'Alarm bulunamadı'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $alert
        ]);
    }

    public function resolve(Request $request, $id)
    {
        $alert = $this->stockAlertService->getAlertById($id);
        $this->authorize('resolve', $alert);

        $validator = Validator::make($request->all(), [
            'resolution_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->stockAlertService->resolveAlert(
                $id,
                auth()->user()->name,
                $validator->validated()['resolution_notes'] ?? null
            );

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alarm çözümlenemedi'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Alarm başarıyla çözümlendi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getStatistics(Request $request)
    {
        $this->authorize('viewAny', StockAlert::class);

        $clinicId = $request->query('clinic_id');
        
        // Otomatik Senkronizasyon
        $this->stockAlertService->syncAlerts($clinicId);
        
        $statistics = $this->stockAlertService->getAlertStatistics($clinicId);

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    public function getPendingCount(Request $request)
    {
        $this->authorize('viewAny', StockAlert::class);

        $clinicId = $request->query('clinic_id');
        $companyId = auth()->user()->company_id;
        $today = now()->toDateString();

        // 🔥 SQL ile tek sorguda hesapla - N+1 problemi çözüldü
        $stats = \DB::table('products')
            ->join('stocks', 'products.id', '=', 'stocks.product_id')
            ->where('stocks.company_id', $companyId)
            ->where('stocks.is_active', true)
            ->when($clinicId, fn($q) => $q->where('stocks.clinic_id', $clinicId))
            ->selectRaw("
                COUNT(DISTINCT CASE 
                    WHEN (stocks.has_sub_unit = 1 AND (stocks.current_stock * COALESCE(stocks.sub_unit_multiplier, 1)) + stocks.current_sub_stock <= COALESCE(products.red_alert_level, products.critical_stock_level, 5))
                    OR (stocks.has_sub_unit = 0 AND stocks.current_stock <= COALESCE(products.red_alert_level, products.critical_stock_level, 5))
                    THEN products.id 
                END) as critical_items,
                COUNT(DISTINCT CASE 
                    WHEN (stocks.has_sub_unit = 1 AND (stocks.current_stock * COALESCE(stocks.sub_unit_multiplier, 1)) + stocks.current_sub_stock <= COALESCE(products.yellow_alert_level, products.min_stock_level, 10))
                    OR (stocks.has_sub_unit = 0 AND stocks.current_stock <= COALESCE(products.yellow_alert_level, products.min_stock_level, 10))
                    THEN products.id 
                END) as low_items,
                COUNT(DISTINCT CASE 
                    WHEN stocks.track_expiry = 1 AND stocks.expiry_date < ? 
                    THEN products.id 
                END) as expired_items
            ", [$today])
            ->first();

        return response()->json([
            'success' => true,
            'data' => ['count' => ($stats->critical_items ?? 0) + ($stats->low_items ?? 0)]
        ]);
    }

    public function getActive(Request $request)
    {
        $filters = $request->only([
            'clinic_id', 'type', 'severity', 'search', 'date_from', 'date_to'
        ]);
        
        $alerts = $this->stockAlertService->getActiveAlerts($filters);

        return response()->json([
            'success' => true,
            'data' => $alerts
        ]);
    }

    public function getSettings(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'email_notifications' => true,
                'push_notifications' => true,
                'daily_digest' => false,
            ]
        ]);
    }

    public function updateSettings(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Ayarlar güncellendi',
            'data' => $request->all()
        ]);
    }

    public function bulkResolve(Request $request)
    {
        $this->authorize('bulkResolve', StockAlert::class);

        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'resolution_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $count = $this->stockAlertService->bulkResolve(
                $request->ids,
                auth()->user()->name,
                $request->resolution_notes ?? null
            );

            return response()->json([
                'success' => true,
                'message' => "{$count} alarm başarıyla çözümlendi",
                'data' => ['count' => $count]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function bulkDismiss(Request $request)
    {
        $this->authorize('bulkDismiss', StockAlert::class);

        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $count = $this->stockAlertService->bulkDismiss($request->ids);

            return response()->json([
                'success' => true,
                'message' => "{$count} alarm yoksayıldı",
                'data' => ['count' => $count]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function bulkDelete(Request $request)
    {
        $this->authorize('bulkDelete', StockAlert::class);

        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $count = $this->stockAlertService->bulkDelete($request->ids);

            return response()->json([
                'success' => true,
                'message' => "{$count} alarm silindi",
                'data' => ['count' => $count]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function dismiss(Request $request, $id)
    {
        $alert = $this->stockAlertService->getAlertById($id);
        $this->authorize('dismiss', $alert);

        try {
            $result = $this->stockAlertService->dismissAlert($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alarm yoksayılamadı'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Alarm başarıyla yoksayıldı'
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
        $alert = $this->stockAlertService->getAlertById($id);
        $this->authorize('delete', $alert);

        try {
            $result = $this->stockAlertService->deleteAlert($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alarm silinemedi'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Alarm başarıyla silindi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}