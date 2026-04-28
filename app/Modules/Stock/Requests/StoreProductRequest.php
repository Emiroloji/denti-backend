<?php

namespace App\Modules\Stock\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:20',
            'category' => 'nullable|string|max:50',
            'brand' => 'nullable|string|max:50',
            'min_stock_level' => 'nullable|integer|min:0',
            'critical_stock_level' => 'nullable|integer|min:0',
            'yellow_alert_level' => 'nullable|integer|min:0',
            'red_alert_level' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ];
    }
}
