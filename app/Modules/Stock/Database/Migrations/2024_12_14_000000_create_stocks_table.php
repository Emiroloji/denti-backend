<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('unit');
            $table->string('category')->nullable();
            $table->string('brand')->nullable();

            //tedarik bilgileri
            $table->foreignId('supplier_id')->constrained()->onDelete('restrict');
            $table->decimal('purchase_price', 10, 2)->nullable(); // Alış fiyatı
            $table->date('purchase_date')->nullable(); // Alış tarihi
            $table->date('expiry_date')->nullable(); // Son kullanma tarihi

            // Stok seviyeleri
            $table->integer('current_stock')->default(0); // Mevcut stok
            $table->integer('reserved_stock')->default(0); // Rezerve stok
            $table->integer('available_stock')->default(0); // Kullanılabilir stok
            $table->integer('min_stock_level')->default(10); // Minimum stok seviyesi
            $table->integer('critical_stock_level')->default(5); // Kritik stok seviyesi

            // Alarm seviyeleri
            $table->integer('yellow_alert_level')->default(10); // Sarı alarm seviyesi
            $table->integer('red_alert_level')->default(5); // Kırmızı alarm seviyesi

            // İç kullanım
            $table->integer('internal_usage_count')->default(0); // İç kullanım adedi

            // Durum
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->boolean('track_expiry')->default(true); // Son kullanma tarihi takibi
            $table->boolean('track_batch')->default(false); // Lot takibi

            // Konum bilgileri
            $table->foreignId('clinic_id')->constrained()->onDelete('restrict'); // Hangi klinike ait
            $table->string('storage_location')->nullable(); // Depo konumu

            $table->timestamps();

            // İndeksler
            $table->index(['name', 'status']);
            $table->index(['clinic_id', 'status']);
            $table->index(['supplier_id']);
            $table->index(['expiry_date']);
            $table->index(['current_stock', 'min_stock_level']);

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('stocks');
    }
};