<?php
// app/Http/Requests/CreateCategoryRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateCategoryRequest extends FormRequest
{
    /**
     * Kullanıcı bu isteği yapabilir mi?
     */
    public function authorize(): bool
    {
        return true; // Şimdilik herkes yapabilir
    }

    /**
     * Validation kuralları
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'unique:categories,name' // Kategori adı benzersiz olmalı
            ],
            'color' => [
                'nullable',
                'string',
                'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/' // Hex color validation
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'is_active' => [
                'nullable',
                'boolean'
            ]
        ];
    }

    /**
     * Özel hata mesajları
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Kategori adı zorunludur.',
            'name.min' => 'Kategori adı en az 2 karakter olmalıdır.',
            'name.max' => 'Kategori adı en fazla 255 karakter olabilir.',
            'name.unique' => 'Bu kategori adı zaten kullanılıyor.',
            'color.regex' => 'Renk kodu geçerli hex formatında olmalıdır. Örnek: #FF5733',
            'description.max' => 'Açıklama en fazla 1000 karakter olabilir.',
            'is_active.boolean' => 'Aktiflik durumu true veya false olmalıdır.'
        ];
    }

    /**
     * Attribute'ların görünen isimleri
     */
    public function attributes(): array
    {
        return [
            'name' => 'Kategori Adı',
            'color' => 'Renk',
            'description' => 'Açıklama',
            'is_active' => 'Aktiflik Durumu'
        ];
    }

    /**
     * Validation başarısız olduğunda JSON response döner
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation hatası',
                'errors' => $validator->errors()
            ], 422)
        );
    }

    /**
     * Validation'dan önce veriyi hazırla
     */
    protected function prepareForValidation()
    {
        // Name'i trim'le ve küçük harfe çevir (case-insensitive unique için)
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        // Color default değeri
        if (!$this->has('color') || empty($this->color)) {
            $this->merge([
                'color' => '#6B7280'
            ]);
        }

        // is_active default değeri
        if (!$this->has('is_active')) {
            $this->merge([
                'is_active' => true
            ]);
        }
    }
}