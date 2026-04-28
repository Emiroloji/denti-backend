<?php

namespace App\Modules\Stock\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Stock\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

use App\Modules\Stock\Resources\ProductResource;

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
