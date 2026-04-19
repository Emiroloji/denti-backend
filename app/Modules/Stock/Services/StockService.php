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

    public function getStockById(int $id): ?Stock
    {
        return $this->stockRepository->find($id);
    }

    public function updateStock(int $id, array $data): ?Stock
    {
        return DB::transaction(function () use ($id, $data) {
            $stock = $this->stockRepository->find($id);
            if (!$stock) return null;

            // Kullanılabilir stok güncelle (Ana birim cinsinden)
            if (isset($data['current_stock']) || isset($data['reserved_stock'])) {
                $currentStock = $data['current_stock'] ?? $stock->current_stock;
                $reservedStock = $data['reserved_stock'] ?? $stock->reserved_stock;
                $data['available_stock'] = $currentStock - $reservedStock;
            }

            $updatedStock = $this->stockRepository->update($id, $data);

            if ($updatedStock) {
                $this->checkStockLevels($updatedStock);
            }

            return $updatedStock;
        });
    }

    public function adjustStock(int $stockId, int $quantity, string $reason, string $performedBy, bool $isSubUnit = false): bool
    {
        return DB::transaction(function () use ($stockId, $quantity, $reason, $performedBy, $isSubUnit) {
            $stock = $this->stockRepository->find($stockId);
            if (!$stock) return false;

            $previousTotal = $stock->total_base_units;
            
            if ($isSubUnit && $stock->has_sub_unit) {
                // Alt birim düzeltmesi
                $newSubStock = $stock->current_sub_stock + $quantity;
                $newMainStock = $stock->current_stock;

                if ($newSubStock >= $stock->sub_unit_multiplier) {
                    $boxesToAdd = (int) floor($newSubStock / $stock->sub_unit_multiplier);
                    $newMainStock += $boxesToAdd;
                    $newSubStock = $newSubStock % $stock->sub_unit_multiplier;
                } elseif ($newSubStock < 0) {
                    $boxesToTake = (int) ceil(abs($newSubStock) / $stock->sub_unit_multiplier);
                    if ($newMainStock < $boxesToTake) return false; 
                    $newMainStock -= $boxesToTake;
                    $newSubStock = ($boxesToTake * $stock->sub_unit_multiplier) + $newSubStock;
                }

                $this->stockRepository->update($stockId, [
                    'current_stock' => $newMainStock,
                    'current_sub_stock' => $newSubStock,
                    'available_stock' => $newMainStock - $stock->reserved_stock
                ]);
            } else {
                // Ana birim düzeltmesi
                $newStock = $stock->current_stock + $quantity;
                if ($newStock < 0) return false;

                $this->stockRepository->update($stockId, [
                    'current_stock' => $newStock,
                    'available_stock' => $newStock - $stock->reserved_stock
                ]);
            }

            $freshStock = $stock->fresh();

            $this->createTransaction([
                'stock_id' => $stockId,
                'clinic_id' => $stock->clinic_id,
                'type' => 'adjustment',
                'quantity' => abs($quantity),
                'previous_stock' => $previousTotal,
                'new_stock' => $freshStock->total_base_units,
                'description' => ($isSubUnit ? "Alt Birim Düzeltme: " : "Ana Birim Düzeltme: ") . $reason,
                'performed_by' => $performedBy,
                'transaction_date' => now()
            ]);

            $this->checkStockLevels($freshStock);

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

    public function createStock(array $data): Stock
    {
        return DB::transaction(function () use ($data) {
            $data['is_active'] = $data['is_active'] ?? true;
            $data['status'] = $data['is_active'] ? 'active' : 'inactive';
            $data['currency'] = $data['currency'] ?? 'TRY';
            $data['track_expiry'] = $data['track_expiry'] ?? true;
            $data['track_batch'] = $data['track_batch'] ?? false;
            $data['current_sub_stock'] = $data['current_sub_stock'] ?? 0;
            $data['has_sub_unit'] = $data['has_sub_unit'] ?? false;

            if (!isset($data['code'])) {
                $data['code'] = $this->generateStockCode($data['clinic_id']);
            }

            $data['available_stock'] = $data['current_stock'] - ($data['reserved_stock'] ?? 0);

            $stock = $this->stockRepository->create($data);

            $this->checkStockLevels($stock);

            return $stock;
        });
    }

    public function deleteStock(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $stock = $this->stockRepository->find($id);
            if (!$stock) return false;

            $stock->alerts()->delete();
            return $this->stockRepository->delete($id);
        });
    }

    public function forceDeleteStock(int $id): bool
    {
        return $this->deleteStock($id);
    }

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

    protected function generateStockCode(int $clinicId): string
    {
        $clinic = app(ClinicService::class)->getClinicById($clinicId);
        $prefix = $clinic ? $clinic->code : 'STK';
        $sequence = $this->stockRepository->getNextSequenceNumber($clinicId);

        return $prefix . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    protected function checkStockLevels(Stock $stock): void
    {
        CheckStockLevelsJob::dispatch($stock);
    }

    protected function createTransaction(array $data): void
    {
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
}
