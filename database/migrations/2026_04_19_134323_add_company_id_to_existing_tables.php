<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'users',
            'stocks',
            'clinics',
            'suppliers',
            'stock_requests',
            'stock_transactions',
            'stock_alerts',
            'categories',
            'todos'
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                // Mevcut veriler için nullable yapıyoruz, sonra 1'e setleyip constrained yapabiliriz.
                // Şimdilik basitlik adına nullable ve index ekliyoruz.
                $table->foreignId('company_id')->after('id')->nullable()->constrained('companies')->onDelete('cascade');
                $table->index('company_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'users',
            'stocks',
            'clinics',
            'suppliers',
            'stock_requests',
            'stock_transactions',
            'stock_alerts',
            'categories',
            'todos'
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['company_id']);
                $table->dropColumn('company_id');
            });
        }
    }
};
