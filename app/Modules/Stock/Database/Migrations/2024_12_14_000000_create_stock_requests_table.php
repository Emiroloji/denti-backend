<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stock_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique(); // Talep numarası

            // Talep eden ve talep edilen klinik
            $table->foreignId('requester_clinic_id')->constrained('clinics')->onDelete('restrict');
            $table->foreignId('requested_from_clinic_id')->constrained('clinics')->onDelete('restrict');

            // Talep edilen stok
            $table->foreignId('stock_id')->constrained()->onDelete('restrict');
            $table->integer('requested_quantity'); // Talep edilen miktar
            $table->integer('approved_quantity')->nullable(); // Onaylanan miktar

            // Durum
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])
                  ->default('pending');

            // Açıklamalar
            $table->text('request_reason')->nullable(); // Talep sebebi
            $table->text('admin_notes')->nullable(); // Yönetici notları
            $table->text('rejection_reason')->nullable(); // Red sebebi

            // Tarihler
            $table->timestamp('requested_at'); // Talep tarihi
            $table->timestamp('approved_at')->nullable(); // Onay tarihi
            $table->timestamp('completed_at')->nullable(); // Tamamlanma tarihi

            // Kullanıcı bilgileri
            $table->string('requested_by'); // Talep eden kişi
            $table->string('approved_by')->nullable(); // Onaylayan kişi

            $table->timestamps();

            $table->index(['requester_clinic_id', 'status']);
            $table->index(['requested_from_clinic_id', 'status']);
            $table->index(['stock_id']);
            $table->index(['status', 'requested_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('stock_requests');
    }
};