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
        Schema::table('stock_requests', function (Blueprint $table) {
            $table->index('status', 'idx_requests_status');
            $table->index('requested_at', 'idx_requests_requested_at');
            $table->index(['requester_clinic_id', 'status'], 'idx_requests_clinic_status');
            $table->index(['requested_from_clinic_id', 'status'], 'idx_requests_from_clinic_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_requests', function (Blueprint $table) {
            $table->dropIndex('idx_requests_status');
            $table->dropIndex('idx_requests_requested_at');
            $table->dropIndex('idx_requests_clinic_status');
            $table->dropIndex('idx_requests_from_clinic_status');
        });
    }
};
