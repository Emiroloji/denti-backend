<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository
{
    public function getAllWithFilters(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::query()
            ->with(['batches.clinic:id,name', 'clinic:id,name'])
            ->withCount('batches');

        $isSqlite = \Illuminate\Support\Facades\DB::getDriverName() === 'sqlite';
        $now = now();

        // 1. Arama (İsim veya SKU)
        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('sku', 'like', $search);
            });
        }

        // 2. Kategori
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        // 3. Klinik Filtresi
        if (!empty($filters['clinic_id'])) {
            $clinicId = $filters['clinic_id'];
            $query->where(function($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId)
                  ->orWhereHas('batches', function($batchQuery) use ($clinicId) {
                      $batchQuery->where('clinic_id', $clinicId);
                  });
            });
        }

        // 4. Durum (Aktif/Pasif)
        if (!empty($filters['status'])) {
            $query->where('is_active', $filters['status'] === 'active');
        }

        // 5. Seviye (Stok ve SKT Uyarıları)
        if (!empty($filters['level'])) {
            $level = $filters['level'];
            
            // Stok Miktarı Bazlı Filtreler (Total Stock)
            if (in_array($level, ['low', 'critical'])) {
                // Optimization: Use subquery in WHERE to avoid repeated SUM calculations if possible, 
                // but for readability and relative speed, we'll refine the existing one to be more targeted.
                if ($level === 'critical') {
                    $query->whereHas('batches', function($q) {
                        $q->where('is_active', 1);
                    })->whereRaw("(SELECT SUM(current_stock) FROM stocks WHERE product_id = products.id AND is_active = 1) <= COALESCE(red_alert_level, critical_stock_level)");
                } else {
                    $query->whereRaw("(SELECT SUM(current_stock) FROM stocks WHERE product_id = products.id AND is_active = 1) <= COALESCE(yellow_alert_level, min_stock_level)")
                          ->whereRaw("(SELECT SUM(current_stock) FROM stocks WHERE product_id = products.id AND is_active = 1) > COALESCE(red_alert_level, critical_stock_level)");
                }
            }
            
            // SKT (Miyat) Bazlı Filtreler
            if (in_array($level, ['near_expiry', 'critical_expiry', 'expired'])) {
                $query->whereHas('batches', function($q) use ($level, $isSqlite, $now) {
                    $q->where('is_active', 1)->where('track_expiry', 1);
                    
                    if ($level === 'expired') {
                        $q->where('expiry_date', '<=', $now->toDateTimeString());
                    } elseif ($level === 'critical_expiry') {
                        $redDaysSql = $isSqlite 
                            ? "date(?, '+' || COALESCE(expiry_red_days, 15) || ' days')"
                            : "DATE_ADD(?, INTERVAL COALESCE(expiry_red_days, 15) DAY)";
                        $q->whereRaw("expiry_date <= {$redDaysSql}", [$now->toDateTimeString()]);
                    } else { // near_expiry
                        $yellowDaysSql = $isSqlite
                            ? "date(?, '+' || COALESCE(expiry_yellow_days, 30) || ' days')"
                            : "DATE_ADD(?, INTERVAL COALESCE(expiry_yellow_days, 30) DAY)";
                        $q->whereRaw("expiry_date <= {$yellowDaysSql}", [$now->toDateTimeString()]);
                    }
                });
            }
        }

        return $query->latest()->paginate($perPage);
    }

    public function find(int $id): ?Product
    {
        return Product::with(['batches.supplier', 'batches.clinic', 'clinic'])
            ->withSum(['stockTransactions as total_in' => function($q) {
                $q->whereIn('type', ['entry', 'adjustment_plus', 'adjustment_increase', 'purchase', 'transfer_in', 'returned', 'return_in']);
            }], 'quantity')
            ->withSum(['stockTransactions as total_out' => function($q) {
                $q->whereIn('type', ['usage', 'loss', 'adjustment_minus', 'adjustment_decrease', 'transfer_out', 'expired', 'damaged', 'return_out']);
            }], 'quantity')
            ->find($id);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(int $id, array $data): ?Product
    {
        $product = Product::find($id);
        if ($product) {
            $product->update($data);
            return $product;
        }
        return null;
    }

    public function delete(int $id): bool
    {
        $product = Product::find($id);
        if ($product) {
            return $product->delete();
        }
        return false;
    }

    public function getTransactions(int $id): Collection
    {
        $stockIds = \App\Models\Stock::where('product_id', $id)->pluck('id')->toArray();
        
        if (empty($stockIds)) {
            return new Collection();
        }

        return \App\Models\StockTransaction::with(['user', 'stock.product'])
            ->whereIn('stock_id', $stockIds)
            ->orderByDesc('transaction_date')
            ->get();
    }
}
