<?php
// app/Http/Resources/CategoryCollection.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->collection->count(),
                'active_count' => $this->collection->where('is_active', true)->count(),
                'inactive_count' => $this->collection->where('is_active', false)->count(),
                'total_todos' => $this->collection->sum('todos_count'),
            ],
            'summary' => [
                'categories_summary' => $this->getCategorySummary(),
                'color_distribution' => $this->getColorDistribution(),
            ]
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with(Request $request): array
    {
        return [
            'links' => [
                'self' => $request->url(),
                'create' => route('api.categories.store') ?? $request->url(),
            ],
            'meta' => [
                'resource_type' => 'category_collection',
                'api_version' => '1.0',
                'generated_at' => now()->toISOString(),
            ]
        ];
    }

    /**
     * Kategori özeti
     */
    private function getCategorySummary(): array
    {
        $summary = [];

        foreach ($this->collection as $category) {
            $summary[] = [
                'name' => $category->name,
                'todos_count' => $category->todos_count ?? 0,
                'status' => $category->is_active ? 'active' : 'inactive'
            ];
        }

        return $summary;
    }

    /**
     * Renk dağılımı
     */
    private function getColorDistribution(): array
    {
        return $this->collection
            ->groupBy('color')
            ->map(function ($group, $color) {
                return [
                    'color' => $color,
                    'count' => $group->count(),
                    'categories' => $group->pluck('name')->toArray()
                ];
            })
            ->values()
            ->toArray();
    }
}