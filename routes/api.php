<?php
// routes/api.php - KOMPLE DOSYA İÇERİĞİ

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controller'ları import et
use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\CategoryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Category Routes
Route::prefix('categories')->group(function () {
    // RESTful routes
    Route::get('/', [CategoryController::class, 'index']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::get('/search', [CategoryController::class, 'search']);
    Route::get('/{id}', [CategoryController::class, 'show']);
    Route::put('/{id}', [CategoryController::class, 'update']);
    Route::delete('/{id}', [CategoryController::class, 'destroy']);
    Route::patch('/{id}/toggle', [CategoryController::class, 'toggle']);
});

// Todo Routes
Route::prefix('todos')->group(function () {
    // Temel CRUD
    Route::get('/', [TodoController::class, 'index']);
    Route::post('/', [TodoController::class, 'store']);
    Route::get('/stats', [TodoController::class, 'stats']);
    Route::get('/uncategorized', [TodoController::class, 'getUncategorized']);
    Route::get('/category/{categoryId}', [TodoController::class, 'getByCategory']);
    Route::get('/{id}', [TodoController::class, 'show']);
    Route::put('/{id}', [TodoController::class, 'update']);
    Route::patch('/{id}/toggle', [TodoController::class, 'toggle']);
    Route::patch('/{id}/move', [TodoController::class, 'moveToCategory']);
    Route::delete('/{id}', [TodoController::class, 'destroy']);
});