<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Stock\Controllers\StockController;
use App\Modules\Stock\Controllers\SupplierController;
use App\Modules\Stock\Controllers\ClinicController;
use App\Modules\Stock\Controllers\StockRequestController;
use App\Modules\Stock\Controllers\StockTransactionController;
use App\Modules\Stock\Controllers\StockAlertController;
use App\Modules\Stock\Controllers\StockReportController;

// Stocks - ✅ SIRAALAMA DÜZELTİLDİ: Specific route'lar önce, generic sonra
Route::prefix('api/stocks')->group(function () {
    // CRUD operations
    Route::get('/', [StockController::class, 'index']);
    Route::post('/', [StockController::class, 'store']);

    // ✅ SPECİFİC ROUTES ÖNCE - Önemli: {id} route'undan önce gelmeli!

    // Stock Statistics
    Route::get('/stats', [StockController::class, 'getStats']);

    // Stock Levels
    Route::get('/low-level', [StockController::class, 'getLowLevel']);
    Route::get('/critical-level', [StockController::class, 'getCriticalLevel']);
    Route::get('/expiring', [StockController::class, 'getExpiring']);

    // Backward compatibility
    Route::get('/levels/low', [StockController::class, 'getLowStockItems']);
    Route::get('/levels/critical', [StockController::class, 'getCriticalStockItems']);
    Route::get('/levels/expiring', [StockController::class, 'getExpiringItems']);

    // ✅ YENİ ENDPOINT'LER - Frontend için
    Route::put('/{id}/deactivate', [StockController::class, 'deactivate']); // Pasif yap
    Route::delete('/{id}/force', [StockController::class, 'forceDelete']); // Kalıcı sil
    Route::put('/{id}/reactivate', [StockController::class, 'reactivate']); // Tekrar aktif et

    // ✅ GENERIC ROUTES SONRA
    Route::get('/{id}', [StockController::class, 'show']);
    Route::put('/{id}', [StockController::class, 'update']);
    Route::delete('/{id}', [StockController::class, 'destroy']); // Soft delete

    // Stock Operations
    Route::post('/{id}/adjust', [StockController::class, 'adjustStock']);
    Route::post('/{id}/use', [StockController::class, 'useStock']);
});
// Suppliers
Route::prefix('api/suppliers')->group(function () {
    Route::get('/', [SupplierController::class, 'index']);
    Route::post('/', [SupplierController::class, 'store']);

    // Specific routes first
    Route::get('/active/list', [SupplierController::class, 'getActive']);

    // Generic routes after
    Route::get('/{id}', [SupplierController::class, 'show']);
    Route::put('/{id}', [SupplierController::class, 'update']);
    Route::delete('/{id}', [SupplierController::class, 'destroy']);
});

// Clinics
Route::prefix('api/clinics')->group(function () {
    Route::get('/', [ClinicController::class, 'index']);
    Route::post('/', [ClinicController::class, 'store']);

    // Specific routes first
    Route::get('/active/list', [ClinicController::class, 'getActive']);

    // Generic routes after
    Route::get('/{id}', [ClinicController::class, 'show']);
    Route::put('/{id}', [ClinicController::class, 'update']);
    Route::delete('/{id}', [ClinicController::class, 'destroy']);
    Route::get('/{id}/stocks', [ClinicController::class, 'getStocks']);
    Route::get('/{id}/summary', [ClinicController::class, 'getSummary']);
});

// Stock Requests
Route::prefix('api/stock-requests')->group(function () {
    Route::get('/', [StockRequestController::class, 'index']);
    Route::post('/', [StockRequestController::class, 'store']);

    // Specific routes first
    Route::get('/pending/list', [StockRequestController::class, 'getPendingRequests']);

    // Generic routes after
    Route::get('/{id}', [StockRequestController::class, 'show']);
    Route::put('/{id}/approve', [StockRequestController::class, 'approve']);
    Route::put('/{id}/reject', [StockRequestController::class, 'reject']);
    Route::put('/{id}/complete', [StockRequestController::class, 'complete']);
});

// Stock Transactions
Route::prefix('api/stock-transactions')->group(function () {
    Route::get('/', [StockTransactionController::class, 'index']);

    // Specific routes first
    Route::get('/stock/{stockId}', [StockTransactionController::class, 'getByStock']);
    Route::get('/clinic/{clinicId}', [StockTransactionController::class, 'getByClinic']);

    // Generic routes after
    Route::get('/{id}', [StockTransactionController::class, 'show']);
});

// Stock Alerts - ✅ Frontend'in kullandığı endpoint'ler eklendi
Route::prefix('api/stock-alerts')->group(function () {
    Route::get('/', [StockAlertController::class, 'index']);

    // Specific routes first
    Route::get('/pending/count', [StockAlertController::class, 'getPendingCount']); // Frontend için
    Route::get('/active', [StockAlertController::class, 'getActive']); // Frontend için
    Route::get('/statistics', [StockAlertController::class, 'getStatistics']); // Frontend için
    Route::get('/settings', [StockAlertController::class, 'getSettings']); // Frontend için
    Route::put('/settings', [StockAlertController::class, 'updateSettings']); // Frontend için

    // Bulk operations
    Route::post('/bulk/resolve', [StockAlertController::class, 'bulkResolve']);
    Route::post('/bulk/dismiss', [StockAlertController::class, 'bulkDismiss']);
    Route::post('/bulk/delete', [StockAlertController::class, 'bulkDelete']);

    // Generic routes after
    Route::get('/{id}', [StockAlertController::class, 'show']);
    Route::put('/{id}/resolve', [StockAlertController::class, 'resolve']);
    Route::post('/{id}/dismiss', [StockAlertController::class, 'dismiss']);
    Route::delete('/{id}', [StockAlertController::class, 'destroy']);
});

// Stock Reports
Route::prefix('api/stock-reports')->group(function () {
    Route::get('/summary', [StockReportController::class, 'summary']);
    Route::get('/movements', [StockReportController::class, 'movements']);
    Route::get('/top-used', [StockReportController::class, 'topUsedItems']);
    Route::get('/supplier-performance', [StockReportController::class, 'supplierPerformance']);
    Route::get('/expiry', [StockReportController::class, 'expiryReport']);
    Route::get('/clinic-comparison', [StockReportController::class, 'clinicComparison']);
    Route::get('/custom', [StockReportController::class, 'customReport']);
});

/*
✅ ROUTE SIRALAMASINDA ÖNEMLİ NOTLAR:

1. SPECİFİC ROUTES ÖNCE:
   - /stocks/stats
   - /stocks/low-level
   - /stocks/critical-level
   - /stocks/expiring

2. GENERİC ROUTES SONRA:
   - /stocks/{id}
   - /stocks/{id}/adjust
   - /stocks/{id}/use

3. NEDEN ÖNEMLİ:
   Laravel router yukarıdan aşağıya eşleşir.
   Eğer /{id} route'u önce gelirse, /stats gibi specific route'lar
   hiçbir zaman çalışmaz çünkü "stats" bir id olarak algılanır.

4. FRONTEND UYUMLULUĞU:
   Frontend şu endpoint'leri bekliyor:
   - GET /api/stocks/stats (✅ eklendi)
   - GET /api/stocks/low-level (✅ eklendi)
   - GET /api/stocks/critical-level (✅ eklendi)
   - GET /api/stocks/expiring (✅ eklendi)

5. BACKWARD COMPATİBİLİTY:
   Eski endpoint'ler de korundu:
   - /stocks/levels/low
   - /stocks/levels/critical
   - /stocks/levels/expiring
*/