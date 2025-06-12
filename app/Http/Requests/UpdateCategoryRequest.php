<?php
// app/Http/Requests/UpdateCategoryRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('id'); // URL'den category ID'sini al

        return [
            'name' => [
                'sometimes', // Sadece gönderilirse validate et
                'required',
                'string',
                'min:2',
                'max:255',
                Rule::unique('categories', 'name')->ignore($categoryId) // Kendisi hariç unique
            ],
            'color' => [
                'nullable',
                'string',
                'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'
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

    public function messages(): array
    {
        return [
            'name.required' => 'Kategori adı zorunludur.',
            'name.min' => 'Kategori adı en az 2 karakter olmalıdır.',
            'name.max' => 'Kategori adı en fazla 255 karakter olabilir.',
            'name.unique' => 'Bu kategori adı başka bir kategori tarafından kullanılıyor.',
            'color.regex' => 'Renk kodu geçerli hex formatında olmalıdır. Örnek: #FF5733',
            'description.max' => 'Açıklama en fazla 1000 karakter olabilir.',
            'is_active.boolean' => 'Aktiflik durumu true veya false olmalıdır.'
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Kategori Adı',
            'color' => 'Renk',
            'description' => 'Açıklama',
            'is_active' => 'Aktiflik Durumu'
        ];
    }

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

    protected function prepareForValidation()
    {
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }
    }
}