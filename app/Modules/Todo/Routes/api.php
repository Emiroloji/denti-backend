<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Todo\Controllers\TodoController;

Route::prefix('api/todos')->group(function () {
    Route::get('/', [TodoController::class, 'index']);
    Route::post('/', [TodoController::class, 'store']);
    Route::get('/stats', [TodoController::class, 'stats']);
    Route::get('/category/{categoryId}', [TodoController::class, 'byCategory']);
    Route::get('/{id}', [TodoController::class, 'show']);
    Route::put('/{id}', [TodoController::class, 'update']);
    Route::patch('/{id}/toggle', [TodoController::class, 'toggle']);
    Route::delete('/{id}', [TodoController::class, 'destroy']);
});