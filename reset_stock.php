<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    Schema::disableForeignKeyConstraints();
    
    DB::table('stock_transactions')->truncate();
    DB::table('stocks')->truncate();
    DB::table('products')->truncate();
    
    Schema::enableForeignKeyConstraints();
    
    echo "Stok ve ürün tabloları başarıyla sıfırlandı.\n";
} catch (\Exception $e) {
    echo "Hata: " . $e->getMessage() . "\n";
}
