<?php
// app/Http/Resources/CategoryResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color,
            'description' => $this->description,
            'is_active' => $this->is_active,

            // Computed fields
            'status' => $this->is_active ? 'Aktif' : 'Pasif',
            'status_badge' => [
                'text' => $this->is_active ? 'Aktif' : 'Pasif',
                'color' => $this->is_active ? 'success' : 'secondary'
            ],

            // Conditional fields - sadece gerektiğinde include et
            'todos_count' => $this->when(
                $this->relationLoaded('todos') || isset($this->todos_count),
                function () {
                    return $this->todos_count ?? $this->todos()->count();
                }
            ),

            // İlişkili todos (eğer yüklenmişse)
            'todos' => TodoResource::collection($this->whenLoaded('todos')),

            // Timestamps - formatted
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at?->diffForHumans(),

            // Meta data
            'meta' => [
                'can_delete' => $this->todos()->count() === 0,
                'delete_reason' => $this->todos()->count() > 0 ?
                    'Bu kategoride ' . $this->todos()->count() . ' todo bulunuyor' : null,
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
                'resource_type' => 'category',
                'api_version' => '1.0'
            ]
        ];
    }
}