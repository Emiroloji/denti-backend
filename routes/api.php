<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Auth Routes (Public)
// Not: routes/api.php içinde olduğu için otomatik /api/ ön eki gelir.
// Yani bu route: /api/login olur.
Route::post('/login', [AuthController::class, 'login']);

// Auth Routes (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

// Modül route'ları service provider'lardan otomatik yükleniyor.
// Tüm modül route'ları kendi içlerinde 'auth:sanctum' middleware'i ile korunmaktadır.
