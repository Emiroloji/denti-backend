<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\CategoryController;

// Todo routes
Route::prefix('todos')->group(function () {
    Route::get('/', [TodoController::class, 'index']);
    Route::post('/', [TodoController::class, 'store']);
    Route::get('/stats', [TodoController::class, 'stats']);
    Route::get('/{id}', [TodoController::class, 'show']);
    Route::put('/{id}', [TodoController::class, 'update']);
    Route::patch('/{id}/toggle', [TodoController::class, 'toggle']);
    Route::delete('/{id}', [TodoController::class, 'destroy']);
});

// Category routes
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::get('/{id}', [CategoryController::class, 'show']);
    Route::put('/{id}', [CategoryController::class, 'update']);
    Route::delete('/{id}', [CategoryController::class, 'destroy']);
});