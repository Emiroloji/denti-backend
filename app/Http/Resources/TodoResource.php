<?php
// app/Http/Resources/TodoResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TodoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'completed' => $this->completed,
            'category_id' => $this->category_id,

            // Computed fields
            'status' => $this->completed ? 'Tamamlandı' : 'Bekliyor',
            'status_badge' => [
                'text' => $this->completed ? 'Tamamlandı' : 'Bekliyor',
                'color' => $this->completed ? 'success' : 'warning'
            ],

            // Category information
            'category' => $this->when(
                $this->relationLoaded('category') && $this->category,
                function () {
                    return [
                        'id' => $this->category->id,
                        'name' => $this->category->name,
                        'color' => $this->category->color,
                        'is_active' => $this->category->is_active
                    ];
                }
            ),

            'category_name' => $this->category?->name ?? 'Kategorisiz',
            'category_color' => $this->category?->color ?? '#6B7280',

            // Timestamps
            'completed_at' => $this->completed_at?->format('Y-m-d H:i:s'),
            'completed_at_human' => $this->completed_at?->diffForHumans(),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at?->diffForHumans(),

            // Computed properties
            'is_overdue' => $this->getIsOverdueAttribute(),
            'days_since_created' => $this->created_at?->diffInDays(now()),

            // Meta information
            'meta' => [
                'can_edit' => true, // İleride permission sistemi için
                'can_delete' => true,
                'can_toggle' => true,
                'priority' => $this->getPriority(), // Custom method
            ]
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'resource_type' => 'todo',
                'api_version' => '1.0'
            ]
        ];
    }

    /**
     * Todo prioritesi hesapla (business logic)
     */
    private function getPriority(): string
    {
        if ($this->completed) {
            return 'completed';
        }

        $daysOld = $this->created_at?->diffInDays(now()) ?? 0;

        if ($daysOld > 7) {
            return 'high'; // 1 haftadan eski
        } elseif ($daysOld > 3) {
            return 'medium'; // 3-7 gün arası
        } else {
            return 'low'; // Yeni
        }
    }
}