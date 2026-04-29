<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_number' => $this->transaction_number,
            'type' => $this->type,
            'type_text' => $this->type_text,
            'quantity' => $this->quantity,
            'previous_stock' => $this->previous_stock,
            'new_stock' => $this->new_stock,
            'performed_by' => $this->performed_by,
            'description' => $this->description,
            'notes' => $this->notes,
            'transaction_date' => $this->transaction_date ? $this->transaction_date->format('Y-m-d H:i:s') : null,
            'is_sub_unit' => $this->is_sub_unit,
            'user' => $this->whenLoaded('user', [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ]),
            'stock' => $this->whenLoaded('stock', [
                'id' => $this->stock?->id,
                'batch_number' => $this->stock?->batch_number,
                'expiry_date' => $this->stock?->expiry_date,
                'product_name' => $this->stock?->product?->name,
            ]),
        ];
    }
}
