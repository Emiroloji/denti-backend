<?php
// app/Repositories/Interfaces/TodoRepositoryInterface.php

namespace App\Modules\Todo\Repositories\Interfaces;

use App\Modules\Todo\Models\Todo;
use Illuminate\Database\Eloquent\Collection;

interface TodoRepositoryInterface
{
    public function all(): Collection;
    public function find(int $id): ?Todo;
    public function create(array $data): Todo;
    public function update(int $id, array $data): ?Todo;
    public function delete(int $id): bool;
    public function getCompleted(): Collection;
    public function getPending(): Collection;
    public function getByCategory(int $categoryId): Collection;
    public function getWithCategory(): Collection;
}