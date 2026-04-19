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

        // 2. Varsayılan bir Şirket oluştur
        $company = Company::create([
            'name' => 'Denti Merkez Klinik',
            'domain' => 'denti-merkez.com',
            'subscription_plan' => 'premium',
            'status' => 'active',
        ]);

        // 3. Şirket Sahibi (Admin) Kullanıcısı oluştur
        $admin = User::create([
            'company_id' => $company->id,
            'name' => 'Admin User',
            'email' => 'admin@denti.com',
            'password' => Hash::make('password'),
        ]);

        $admin->assignRole('Company Owner');

        // 4. Test Kullanıcısı oluştur
        $testUser = User::create([
            'company_id' => $company->id,
            'name' => 'Test Doctor',
            'email' => 'doctor@denti.com',
            'password' => Hash::make('password'),
        ]);

        $testUser->assignRole('Doctor');
    }
}
