<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

use App\Http\Resources\ProductResource;

class ProductInertiaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Stock/Index');
    }

    public function show(int $id): Response
    {
        $product = Product::with(['batches.supplier', 'batches.clinic'])->findOrFail($id);
        
        return Inertia::render('Stock/Show', [
            'product' => new ProductResource($product)
        ]);
    }
}
