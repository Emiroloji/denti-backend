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

    public function handle(StockAlertService $stockAlertService)
    {
        Stock::active()->chunk(100, function ($stocks) use ($stockAlertService) {
            foreach ($stocks as $stock) {
                $stockAlertService->checkAndCreateAlerts($stock);
            }
        });

        \Log::info('All stock levels checked');
    }
}