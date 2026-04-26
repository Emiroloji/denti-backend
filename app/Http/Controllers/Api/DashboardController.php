<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Stock\Models\Stock;
use App\Modules\Stock\Models\Clinic;
use App\Traits\JsonResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    use JsonResponseTrait;

    public function index(): JsonResponse
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        if (!$companyId) {
            return $this->error('Şirket bilgisi bulunamadı.', 404);
        }

        $stats = [
            'company_name' => $user->company->name,
            'total_users' => User::where('company_id', $companyId)->count(),
            'total_doctors' => User::where('company_id', $companyId)->role('Doctor')->count(),
            'total_employees' => User::where('company_id', $companyId)->count(),
            'total_stock_items' => Stock::where('company_id', $companyId)->count(),
            'total_clinics' => Clinic::where('company_id', $companyId)->count(),
        ];

        return $this->success($stats, 'Dashboard stats retrieved successfully.');
    }
}
