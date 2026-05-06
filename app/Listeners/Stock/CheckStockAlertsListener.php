<?php

namespace App\Listeners\Stock;

use App\Events\Stock\StockLevelChanged;
use App\Services\StockAlertService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * StockLevelChanged event'ini dinler ve stok seviyesi kontrolünü tetikler.
 * Arka planda çalışması için Queue'ya alınmıştır.
 */
class CheckStockAlertsListener implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels;

    public function __construct(private StockAlertService $alertService) {}

    public function handle(StockLevelChanged $event): void
    {
        $stock = $event->stock->loadMissing(['product.batches']);
        $this->alertService->checkAndCreateAlerts($stock);
    }
}
