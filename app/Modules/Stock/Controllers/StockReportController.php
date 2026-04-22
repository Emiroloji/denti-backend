<?php
// app/Modules/Stock/Controllers/StockReportController.php

namespace App\Modules\Stock\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Stock\Services\StockReportService;
use App\Traits\JsonResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class StockReportController extends Controller
{
    use JsonResponseTrait;

    protected $stockReportService;

    public function __construct(StockReportService $stockReportService)
    {
        $this->stockReportService = $stockReportService;
    }

    public function summary(Request $request): JsonResponse
    {
        try {
            $clinicId = $request->query('clinic_id');
            $summary = $this->stockReportService->getStockSummaryReport($clinicId ? (int)$clinicId : null);

            return $this->success($summary);
        } catch (\Exception $e) {
            Log::error($e);
            return $this->error('Rapor oluşturulurken bir hata oluştu.', 500);
        }
    }

    public function movements(Request $request): JsonResponse
    {
        try {
            $startDate = $request->query('start_date')
                ? Carbon::parse($request->query('start_date'))
                : now()->subMonth();

            $endDate = $request->query('end_date')
                ? Carbon::parse($request->query('end_date'))
                : now();

            $clinicId = $request->query('clinic_id');

            $movements = $this->stockReportService->getStockMovementReport(
                $startDate, 
                $endDate, 
                $clinicId ? (int)$clinicId : null
            );

            return $this->success($movements, 'Hareket raporu', 200, [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'clinic_id' => $clinicId
            ]);
        } catch (\Exception $e) {
            Log::error($e);
            return $this->error('Hareket raporu oluşturulurken bir hata oluştu.', 500);
        }
    }

    public function topUsedItems(Request $request): JsonResponse
    {
        try {
            $startDate = $request->query('start_date')
                ? Carbon::parse($request->query('start_date'))
                : now()->subMonth();

            $endDate = $request->query('end_date')
                ? Carbon::parse($request->query('end_date'))
                : now();

            $limit = (int) $request->query('limit', 10);
            $clinicId = $request->query('clinic_id');

            $items = $this->stockReportService->getTopUsedItemsReport(
                $startDate, 
                $endDate, 
                $limit, 
                $clinicId ? (int)$clinicId : null
            );

            return $this->success($items, 'En çok kullanılan ürünler', 200, [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'limit' => $limit,
                'clinic_id' => $clinicId
            ]);
        } catch (\Exception $e) {
            Log::error($e);
            return $this->error('Kullanım raporu oluşturulurken bir hata oluştu.', 500);
        }
    }


    public function expiryReport(Request $request): JsonResponse
    {
        try {
            $days = (int) $request->query('days', 30);
            $clinicId = $request->query('clinic_id');

            $report = $this->stockReportService->getExpiryReport($days, $clinicId ? (int)$clinicId : null);

            return $this->success($report, 'Süre dolum raporu', 200, [
                'days' => $days,
                'clinic_id' => $clinicId
            ]);
        } catch (\Exception $e) {
            Log::error($e);
            return $this->error('Süre dolum raporu oluşturulurken bir hata oluştu.', 500);
        }
    }

    public function clinicComparison(): JsonResponse
    {
        try {
            $comparison = $this->stockReportService->getClinicComparisonReport();

            return $this->success($comparison);
        } catch (\Exception $e) {
            Log::error($e);
            return $this->error('Klinik karşılaştırma raporu oluşturulurken bir hata oluştu.', 500);
        }
    }

    public function trends(Request $request): JsonResponse
    {
        try {
            $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date')) : now()->subDays(30);
            $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date')) : now();
            $period = $request->query('period', 'day');
            $clinicId = $request->query('clinic_id');

            $trends = $this->stockReportService->getConsumptionTrend($startDate, $endDate, $period, $clinicId ? (int)$clinicId : null);

            return $this->success($trends);
        } catch (\Exception $e) {
            Log::error($e);
            return $this->error('Trend raporu oluşturulurken bir hata oluştu.', 500);
        }
    }


    public function categories(Request $request): JsonResponse
    {
        try {
            $clinicId = $request->query('clinic_id');
            $distribution = $this->stockReportService->getCategoryDistribution($clinicId ? (int)$clinicId : null);

            return $this->success($distribution);
        } catch (\Exception $e) {
            Log::error($e);
            return $this->error('Kategori raporu oluşturulurken bir hata oluştu.', 500);
        }
    }

    public function forecast(Request $request): JsonResponse
    {
        try {
            $clinicId = $request->query('clinic_id');
            $forecast = $this->stockReportService->getLowStockForecast($clinicId ? (int)$clinicId : null);

            return $this->success($forecast);
        } catch (\Exception $e) {
            Log::error($e);
            return $this->error('Tahminleme raporu oluşturulurken bir hata oluştu.', 500);
        }
    }
}
