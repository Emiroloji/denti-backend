<?php
// app/Modules/Stock/Services/StockService.php

namespace App\Modules\Stock\Services;

use App\Modules\Stock\Repositories\Interfaces\StockRepositoryInterface;
use App\Modules\Stock\Models\Stock;
use App\Modules\Stock\Jobs\CheckStockLevelsJob;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class StockService
{
    protected $stockRepository;

    public function __construct(StockRepositoryInterface $stockRepository)
    {
        $this->stockRepository = $stockRepository;
    }

    public function getAllStocks(array $filters = []): Collection
    {
        return $this->stockRepository->getAllWithFilters($filters);
    }

    // ✅ EKSİK METHOD EKLENDİ - Ana sorunun çözümü
    public function getStockById(int $id): ?Stock
    {
        return $this->stockRepository->find($id);
    }



    public function updateStock(int $id, array $data): ?Stock
    {
        return DB::transaction(function () use ($id, $data) {
            $stock = $this->stockRepository->find($id);
            if (!$stock) return null;

            // Kullanılabilir stok güncelle
            if (isset($data['current_stock']) || isset($data['reserved_stock'])) {
                $currentStock = $data['current_stock'] ?? $stock->current_stock;
                $reservedStock = $data['reserved_stock'] ?? $stock->reserved_stock;
                $data['available_stock'] = $currentStock - $reservedStock;
            }

            $updatedStock = $this->stockRepository->update($id, $data);

            // Stok seviyesi kontrolü
            if ($updatedStock) {
                $this->checkStockLevels($updatedStock);
            }

            return $updatedStock;
        });
    }



    public function adjustStock(int $stockId, int $quantity, string $reason, string $performedBy): bool
    {
        return DB::transaction(function () use ($stockId, $quantity, $reason, $performedBy) {
            $stock = $this->stockRepository->find($stockId);
            if (!$stock) return false;

            $previousStock = $stock->current_stock;
            $newStock = $previousStock + $quantity;

            // Stok güncelle
            $this->stockRepository->update($stockId, [
                'current_stock' => $newStock,
                'available_stock' => $newStock - $stock->reserved_stock
            ]);

            // İşlem kaydı oluştur
            $this->createTransaction([
                'stock_id' => $stockId,
                'clinic_id' => $stock->clinic_id,
                'type' => 'adjustment',
                'quantity' => abs($quantity),
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'description' => $reason,
                'performed_by' => $performedBy,
                'transaction_date' => now()
            ]);

            // Stok seviyesi kontrolü
            $this->checkStockLevels($stock->fresh());

            return true;
        });
    }

    public function useStock(int $stockId, int $quantity, string $performedBy, string $notes = null): bool
    {
        return DB::transaction(function () use ($stockId, $quantity, $performedBy, $notes) {
            $stock = $this->stockRepository->find($stockId);
            
            if (!$stock) {
                return false;
            }

            $isSubUnitUsage = $stock->has_sub_unit && $stock->sub_unit_multiplier > 0;
            $newMainStock = $stock->current_stock;
            $newSubStock = $stock->current_sub_stock;

            if ($isSubUnitUsage) {
                $needed = $quantity;
                
                if ($newSubStock >= $needed) {
                    $newSubStock -= $needed;
                } else {
                    $deficit = $needed - $newSubStock;
                    $boxesToOpen = (int) ceil($deficit / $stock->sub_unit_multiplier);

                    if ($newMainStock < $boxesToOpen) {
                        return false; 
                    }

                    $newMainStock -= $boxesToOpen;
                    $newSubStock = $newSubStock + ($boxesToOpen * $stock->sub_unit_multiplier) - $needed;
                }
            } else {
                if ($stock->available_stock < $quantity) {
                    return false;
                }
                $newMainStock -= $quantity;
            }

            $updateData = [
                'current_stock' => $newMainStock,
                'available_stock' => $newMainStock - $stock->reserved_stock,
                'internal_usage_count' => $stock->internal_usage_count + $quantity
            ];

            if ($isSubUnitUsage) {
                $updateData['current_sub_stock'] = $newSubStock;
            }

            $this->stockRepository->update($stockId, $updateData);

            $this->createTransaction([
                'stock_id' => $stockId,
                'clinic_id' => $stock->clinic_id,
                'type' => 'usage',
                'quantity' => $quantity,
                'previous_stock' => $isSubUnitUsage ? $stock->total_base_units : $stock->current_stock,
                'new_stock' => $isSubUnitUsage ? 
                    (($newMainStock * $stock->sub_unit_multiplier) + $newSubStock) : 
                    $newMainStock,
                'notes' => $notes,
                'performed_by' => $performedBy,
                'transaction_date' => now()
            ]);

            $this->checkStockLevels($stock->fresh());

            return true;
        });
    }

    protected function generateStockCode(int $clinicId): string
    {
        $clinic = app(ClinicService::class)->getClinicById($clinicId);
        $prefix = $clinic ? $clinic->code : 'STK';
        $sequence = $this->stockRepository->getNextSequenceNumber($clinicId);

        return $prefix . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    protected function checkStockLevels(Stock $stock): void
    {
        // Job olarak çalıştır (async)
        CheckStockLevelsJob::dispatch($stock);
    }

    protected function createTransaction(array $data): void
    {
        // Transaction numarası oluştur
        $data['transaction_number'] = $this->generateTransactionNumber();

        app(StockTransactionService::class)->createTransaction($data);
    }

    protected function generateTransactionNumber(): string
    {
        $date = now()->format('Ymd');
        $sequence = DB::table('stock_transactions')
                     ->whereDate('created_at', now())
                     ->count() + 1;

        return 'TXN-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function getLowStockItems(int $clinicId = null): Collection
    {
        return $this->stockRepository->getLowStockItems($clinicId);
    }

    public function getCriticalStockItems(int $clinicId = null): Collection
    {
        return $this->stockRepository->getCriticalStockItems($clinicId);
    }

    public function getExpiringItems(int $days = 30, int $clinicId = null): Collection
    {
        return $this->stockRepository->getExpiringItems($days, $clinicId);
    }

    public function getExpiredItems(int $clinicId = null): Collection
    {
        return $this->stockRepository->getExpiredItems($clinicId);
    }

    // ✅ YENİ METHOD EKLENDİ - Frontend'in ihtiyaç duyduğu stats
    public function getStockStats(int $clinicId = null): array
    {
        $baseQuery = $this->stockRepository->getBaseQuery();

        if ($clinicId) {
            $baseQuery->where('clinic_id', $clinicId);
        }

        $totalItems = $baseQuery->count();
        $lowStockItems = (clone $baseQuery)->lowStock()->count();
        $criticalStockItems = (clone $baseQuery)->criticalStock()->count();
        $expiringItems = (clone $baseQuery)->nearExpiry(30)->count();
        $totalValue = (clone $baseQuery)->sum(DB::raw('purchase_price * current_stock'));

        return [
            'total_items' => $totalItems,
            'low_stock_items' => $lowStockItems,
            'critical_stock_items' => $criticalStockItems,
            'expiring_items' => $expiringItems,
            'total_value' => round($totalValue, 2)
        ];
    }




    /**
     * Get all stocks including inactive and deleted
     */
    public function getAllStocksWithInactive(array $filters = []): Collection
    {
        return $this->stockRepository->getAllWithFiltersIncludingInactive($filters);
    }

    /**
     * ✅ DELETE METODUNU DÜZELTELİM - Soft delete mantığı
     */
    public function deleteStock(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $stock = $this->stockRepository->find($id);
            if (!$stock) return false;

            // İşlem kayıtları varsa soft delete yap
            if ($stock->transactions()->count() > 0 || $stock->requests()->count() > 0) {
                // Soft delete - sadece pasif yap
                $this->stockRepository->update($id, [
                    'status' => 'deleted',
                    'is_active' => false,
                    'current_stock' => 0,
                    'available_stock' => 0,
                    'current_sub_stock' => 0
                ]);

                return true; // Başarılı olarak döndür
            }

            // İşlem kaydı yoksa gerçek silme
            return $this->stockRepository->delete($id);
        });
    }

    /**
     * ✅ CREATE METODUNU DÜZELTELİM
     */
    public function createStock(array $data): Stock
    {
        return DB::transaction(function () use ($data) {
            // ✅ EXPLICIT DEFAULT DEĞERLER
            $data['is_active'] = $data['is_active'] ?? true;
            $data['status'] = $data['is_active'] ? 'active' : 'inactive';
            $data['currency'] = $data['currency'] ?? 'TRY';
            $data['track_expiry'] = $data['track_expiry'] ?? true;
            $data['track_batch'] = $data['track_batch'] ?? false;

            // Stok kodu otomatik oluştur
            if (!isset($data['code'])) {
                $data['code'] = $this->generateStockCode($data['clinic_id']);
            }

            // Kullanılabilir stok hesapla
            $data['available_stock'] = $data['current_stock'] - ($data['reserved_stock'] ?? 0);

            // Debug için log
            \Log::info('StockService createStock:', [
                'is_active' => $data['is_active'],
                'status' => $data['status'],
                'name' => $data['name']
            ]);

            $stock = $this->stockRepository->create($data);

            // Stok seviyesi kontrolü
            $this->checkStockLevels($stock);

            return $stock;
        });


    }
    public function forceDeleteStock(int $id): bool
        {
            return DB::transaction(function () use ($id) {
                $stock = $this->stockRepository->find($id);
                if (!$stock) return false;

                // İşlem kayıtları kontrolü
                if ($stock->transactions()->count() > 0 || $stock->requests()->count() > 0) {
                    throw new \Exception('Bu stok için işlem kayıtları mevcut. Kalıcı silme yapılamaz.');
                }

                // Alerts'leri de sil
                $stock->alerts()->delete();

                // Gerçek silme
                return $this->stockRepository->delete($id);
            });
        }
}