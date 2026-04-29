<?php

namespace App\Observers;

use App\Models\Stock;
use App\Services\ClinicService;
use App\Repositories\Interfaces\StockRepositoryInterface;

class StockObserver
{
    protected $stockRepository;
    protected $clinicService;

    public function __construct(
        StockRepositoryInterface $stockRepository,
        ClinicService $clinicService
    ) {
        $this->stockRepository = $stockRepository;
        $this->clinicService = $clinicService;
    }
}
