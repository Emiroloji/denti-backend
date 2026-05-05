<?php

use Inertia\Inertia;

use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('login', [AuthenticatedSessionController::class, 'store']);
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::get('/admin/login', function () {
    return Inertia::render('Auth/AdminLogin');
})->name('admin.login');

Route::get('/accept-invitation/{token}', function ($token) {
    return Inertia::render('Auth/AcceptInvitation', ['token' => $token]);
});

Route::middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('Dashboard/Index');
    })->name('dashboard');

    Route::get('/admin/companies', function () {
        return Inertia::render('Admin/Index');
    })->name('admin.companies');

    Route::get('/stocks', [App\Http\Controllers\Api\ProductInertiaController::class, 'index'])->name('stocks.index');
    Route::get('/stock/products/{id}', [App\Http\Controllers\Api\ProductInertiaController::class, 'show'])->name('products.show');

    Route::get('/stock-categories', function () {
        return Inertia::render('Category/Index');
    });

    Route::get('/suppliers', function () {
        return Inertia::render('Supplier/Index');
    });

    Route::get('/clinics', function () {
        return Inertia::render('Clinic/Index');
    });

    Route::get('/stock-requests', function () {
        return Inertia::render('StockRequest/Index');
    });

    Route::get('/alerts', function () {
        return Inertia::render('Alert/Index');
    });

    Route::get('/todos', function () {
        return Inertia::render('Todo/Index');
    });

    Route::get('/reports', function () {
        return Inertia::render('Report/Index');
    });

    Route::get('/employees', function () {
        return Inertia::render('Employee/Index');
    });



    Route::get('/profile', function () {
        return Inertia::render('Profile/Index');
    });
});
