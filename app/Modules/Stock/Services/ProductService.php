<?php

namespace App\Modules\Stock\Services;

use App\Modules\Stock\Repositories\ProductRepository;
use App\Modules\Stock\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    public function __construct(
        protected ProductRepository $productRepository
    ) {}

    public function getAllProducts(array $filters = [], int $perPage = 50): LengthAwarePaginator
    {
        return $this->productRepository->getAllWithFilters($filters, $perPage);
    }

    public function getProductById(int $id): ?Product
    {
        return $this->productRepository->find($id);
    }

    public function createProduct(array $data): Product
    {
        return $this->productRepository->create($data);
    }

    public function updateProduct(int $id, array $data): ?Product
    {
        return $this->productRepository->update($id, $data);
    }

    public function deleteProduct(int $id): bool
    {
        return $this->productRepository->delete($id);
    }

    public function getProductTransactions(int $id)
    {
        return $this->productRepository->getTransactions($id);
    }
}
