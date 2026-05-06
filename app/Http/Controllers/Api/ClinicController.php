<?php

// ==============================================
// 3. ClinicController
// app/Modules/Stock/Controllers/ClinicController.php
// ==============================================

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClinicService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ClinicController extends Controller
{
    protected $clinicService;

    public function __construct(ClinicService $clinicService)
    {
        $this->clinicService = $clinicService;
    }

    public function index(): JsonResponse
    {
        try {
            $clinics = $this->clinicService->getAllClinics();
            return $this->success($clinics);
        } catch (\Exception $e) {
            Log::error('Klinikler listelenirken hata oluştu: ' . $e->getMessage());
            return $this->error('Klinikler listelenirken bir hata oluştu.', 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();

        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'responsible_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'website' => 'nullable|string|max:255',
            'opening_hours' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'company_id' => 'nullable|exists:companies,id'
        ]);

        if ($validator->fails()) {
            return $this->error('Validasyon hatası', 422, $validator->errors()->toArray());
        }

        try {
            $validatedData = $validator->validated();
            
            // 🛡️ Yetki ve Şirket Kontrolü
            $currentUser = auth()->user();
            
            if (!$currentUser->isSuperAdmin()) {
                $validatedData['company_id'] = $currentUser->company_id;
            }

            if (empty($validatedData['company_id'])) {
                Log::error('Klinik oluşturma hatası: Kullanıcının şirket bilgisi (company_id) eksik.', ['user_id' => $currentUser->id]);
                return $this->error('Klinik oluşturmak için bir şirkete bağlı olmalısınız.', 400);
            }

            $clinic = $this->clinicService->createClinic($validatedData);
            
            $cacheCompanyId = $currentUser->isSuperAdmin()
                ? ($validatedData['company_id'] ?? 'global')
                : ($currentUser->company_id ?? 'global');
            \Illuminate\Support\Facades\Cache::forget("all_clinics_{$cacheCompanyId}");
            
            return $this->success($clinic, 'Klinik başarıyla oluşturuldu', 201);
        } catch (\Exception $e) {
            Log::error('Klinik oluşturulurken teknik hata: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->error('Klinik oluşturulamadı: ' . $e->getMessage(), 400);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $clinic = $this->clinicService->getClinicById($id);

            if (!$clinic) {
                return $this->error('Klinik bulunamadı', 404);
            }

            return $this->success($clinic);
        } catch (\Exception $e) {
            Log::error('Klinik getirilirken hata: ' . $e->getMessage());
            return $this->error('Klinik getirilirken bir hata oluştu.', 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $data = $request->all();

        $validator = Validator::make($data, [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'responsible_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'website' => 'nullable|string|max:255',
            'opening_hours' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'company_id' => 'nullable|exists:companies,id'
        ]);

        if ($validator->fails()) {
            return $this->error('Validasyon hatası', 422, $validator->errors()->toArray());
        }

        try {
            $clinic = $this->clinicService->updateClinic($id, $validator->validated());

            if (!$clinic) {
                return $this->error('Klinik bulunamadı', 404);
            }

            $u = auth()->user();
            $cid = $u->isSuperAdmin() ? ($clinic->company_id ?? 'global') : ($u->company_id ?? 'global');
            \Illuminate\Support\Facades\Cache::forget("all_clinics_{$cid}");

            return $this->success($clinic, 'Klinik başarıyla güncellendi');
        } catch (\Exception $e) {
            Log::error('Klinik güncellenirken hata: ' . $e->getMessage());
            return $this->error($e->getMessage(), 400);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $clinic = $this->clinicService->getClinicById($id);
            if (!$clinic) {
                return $this->error('Klinik bulunamadı', 404);
            }

            // Super Admin değilse kendi şirketinin kliniği mi kontrol et
            if (!auth()->user()->hasRole('Super Admin') && $clinic->company_id !== auth()->user()->company_id) {
                return $this->error('Bu işlem için yetkiniz yok.', 403);
            }

            $companyIdForCache = $clinic->company_id ?? 'global';
            $deleted = $this->clinicService->deleteClinic($id);

            if (!$deleted) {
                return $this->error('Klinik silme işlemi başarısız.', 400);
            }

            \Illuminate\Support\Facades\Cache::forget("all_clinics_{$companyIdForCache}");

            return $this->success(null, 'Klinik başarıyla silindi');
        } catch (\Exception $e) {
            Log::error('Klinik silinirken hata: ' . $e->getMessage());
            return $this->error('Silme hatası: ' . $e->getMessage(), 400);
        }
    }

    public function getActive(): JsonResponse
    {
        try {
            $clinics = $this->clinicService->getActiveClinics();
            return $this->success($clinics);
        } catch (\Exception $e) {
            Log::error('Aktif klinikler getirilirken hata: ' . $e->getMessage());
            return $this->error('Aktif klinikler getirilirken hata oluştu.', 500);
        }
    }

    public function getStats(): JsonResponse
    {
        try {
            $stats = $this->clinicService->getClinicStats();
            return $this->success($stats);
        } catch (\Exception $e) {
            Log::error('Klinik istatistikleri getirilirken hata: ' . $e->getMessage());
            return $this->error('İstatistikler getirilirken hata oluştu.', 500);
        }
    }

    public function getStocks($id): JsonResponse
    {
        try {
            $clinic = $this->clinicService->getClinicById($id);

            if (!$clinic) {
                return $this->error('Klinik bulunamadı', 404);
            }

            $clinic->loadMissing(['stocks.product', 'stocks.supplier']);

            return $this->success($clinic->stocks);
        } catch (\Exception $e) {
            Log::error('Klinik stokları getirilirken hata: ' . $e->getMessage());
            return $this->error('Klinik stokları getirilirken hata oluştu.', 500);
        }
    }

    public function getSummary($id): JsonResponse
    {
        try {
            $summary = $this->clinicService->getClinicStockSummary($id);
            return $this->success($summary);
        } catch (\Exception $e) {
            Log::error('Klinik özeti getirilirken hata: ' . $e->getMessage());
            return $this->error('Klinik özeti getirilirken hata oluştu.', 500);
        }
    }
}