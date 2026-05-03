<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Rolleri ve Yetkileri oluştur
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Super Admin Kullanıcısı oluştur (Şirket bağımsız)
        $superAdmin = User::create([
            'company_id' => null,
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'superadmin@denti.com',
            'password' => Hash::make('superadmin123'),
            'is_active' => true,
        ]);

        $superAdmin->assignRole('Super Admin');

        // 3. Varsayılan bir Şirket oluştur
        $company = Company::create([
            'name' => 'Denti Merkez Klinik',
            'domain' => 'denti-merkez.com',
            'subscription_plan' => 'premium',
            'status' => 'active',
        ]);

        // 4. Şirket Sahibi (Admin) Kullanıcısı oluştur
        $admin = User::create([
            'company_id' => $company->id,
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@denti.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);

        $admin->assignRole('Company Owner');

        // 5. Test Kullanıcısı oluştur
        $testUser = User::create([
            'company_id' => $company->id,
            'name' => 'Test Doctor',
            'username' => 'doctor',
            'email' => 'doctor@denti.com',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);

        $testUser->assignRole('Doctor');
    }
}
