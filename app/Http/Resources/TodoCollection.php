<?php
// app/Http/Resources/TodoCollection.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TodoCollection extends ResourceCollection
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
                'completed' => $this->collection->where('completed', true)->count(),
                'pending' => $this->collection->where('completed', false)->count(),
                'completion_rate' => $this->getCompletionRate(),
                'categorized' => $this->collection->whereNotNull('category_id')->count(),
                'uncategorized' => $this->collection->whereNull('category_id')->count(),
            ],
            'summary' => [
                'by_category' => $this->getTodosByCategory(),
                'by_status' => $this->getTodosByStatus(),
                'by_priority' => $this->getTodosByPriority(),
                'recent_activity' => $this->getRecentActivity(),
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
                'create' => route('api.todos.store') ?? $request->url(),
                'stats' => route('api.todos.stats') ?? $request->url() . '/stats',
            ],
            'meta' => [
                'resource_type' => 'todo_collection',
                'api_version' => '1.0',
                'generated_at' => now()->toISOString(),
            ]
        ];
    }

    /**
     * Tamamlanma oranı
     */
    private function getCompletionRate(): float
    {
        $total = $this->collection->count();
        if ($total === 0) return 0;

        $completed = $this->collection->where('completed', true)->count();
        return round(($completed / $total) * 100, 2);
    }

    /**
     * Kategoriye göre todo dağılımı
     */
    private function getTodosByCategory(): array
    {
        $grouped = $this->collection->groupBy(function ($todo) {
            return $todo->category?->name ?? 'Kategorisiz';
        });

        return $grouped->map(function ($todos, $categoryName) {
            return [
                'category' => $categoryName,
                'total' => $todos->count(),
                'completed' => $todos->where('completed', true)->count(),
                'pending' => $todos->where('completed', false)->count(),
            ];
        })->values()->toArray();
    }

    /**
     * Duruma göre todo dağılımı
     */
    private function getTodosByStatus(): array
    {
        return [
            'completed' => [
                'count' => $this->collection->where('completed', true)->count(),
                'percentage' => $this->getCompletionRate()
            ],
            'pending' => [
                'count' => $this->collection->where('completed', false)->count(),
                'percentage' => round(100 - $this->getCompletionRate(), 2)
            ]
        ];
    }

    /**
     * Prioriteye göre todo dağılımı
     */
    private function getTodosByPriority(): array
    {
        $priorities = $this->collection->map(function ($todo) {
            if ($todo->completed) return 'completed';

            $daysOld = $todo->created_at?->diffInDays(now()) ?? 0;
            if ($daysOld > 7) return 'high';
            if ($daysOld > 3) return 'medium';
            return 'low';
        });

        return $priorities->countBy()->toArray();
    }

    /**
     * Son aktiviteler
     */
    private function getRecentActivity(): array
    {
        return $this->collection
            ->sortByDesc('updated_at')
            ->take(5)
            ->map(function ($todo) {
                return [
                    'id' => $todo->id,
                    'title' => $todo->title,
                    'action' => $todo->completed ? 'completed' : 'updated',
                    'updated_at' => $todo->updated_at?->diffForHumans(),
                ];
            })
            ->values()
            ->toArray();
    }
}