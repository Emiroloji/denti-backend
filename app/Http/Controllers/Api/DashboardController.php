<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Clinic;
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

        if (!$companyId && !$user->isSuperAdmin()) {
            return $this->error('Şirket bilgisi bulunamadı.', 404);
        }

        if ($user->isSuperAdmin()) {
            $stats = [
                'company_name' => 'Sistem Yönetimi',
                'total_users' => User::count(),
                'total_doctors' => User::role('Doctor')->count(),
                'total_employees' => User::count(),
                'total_stock_items' => Product::count(),
                'total_clinics' => Clinic::count(),
                'total_suppliers' => \App\Models\Supplier::count(),
                'is_super_admin' => true
            ];
            return $this->success($stats, 'Global dashboard stats retrieved successfully.');
        }

        $stats = [
            'company_name' => $user->company->name,
            'total_users' => User::where('company_id', $companyId)->count(),
            'total_doctors' => User::where('company_id', $companyId)->role('Doctor')->count(),
            'total_employees' => User::where('company_id', $companyId)->count(),
            'total_stock_items' => Product::where('company_id', $companyId)->count(),
            'total_clinics' => Clinic::where('company_id', $companyId)->count(),
            'total_suppliers' => \App\Models\Supplier::where('company_id', $companyId)->count(),
        ];

        return $this->success($stats, 'Dashboard stats retrieved successfully.');
    }
}
