<?php

namespace App\Jobs;

use App\Models\Stock;
use App\Services\StockAlertService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckAllStockLevelsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    /**
     * İşlem başarısız olursa kaç kez tekrar deneneceği.
     */
    public int $tries = 3;
    
    /**
     * Tekrar denemeden önce beklenecek saniye.
     */
    public int $backoff = 60;

    public function handle(StockAlertService $stockAlertService)
    {
        $lowStocks = [];

        // Collect all stocks that need alerts
        Stock::active()->with(['product', 'clinic.company'])->chunk(100, function ($stocks) use (&$lowStocks, $stockAlertService) {
            foreach ($stocks as $stock) {
                // We use checkAndCreateAlerts but without immediate notification if possible
                // For simplicity, let's just collect those that HAVE alerts
                $alerts = $stockAlertService->checkAndGetAlerts($stock);
                if (!empty($alerts)) {
                    $companyId = $stock->company_id;
                    $lowStocks[$companyId][] = [
                        'stock' => $stock,
                        'alerts' => $alerts
                    ];
                }
            }
        });

        // Send Digest Notifications per Company
        foreach ($lowStocks as $companyId => $items) {
            $stockAlertService->sendDigestNotification($companyId, $items);
        }

        \Log::info('All stock levels checked and digests sent.');
    }
}