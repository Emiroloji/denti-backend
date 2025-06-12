<?php
// app/Http/Requests/UpdateTodoRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateTodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:255'
            ],
            'description' => [
                'nullable',
                'string',
                'max:2000'
            ],
            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id'
            ],
            'completed' => [
                'nullable',
                'boolean'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Todo başlığı zorunludur.',
            'title.min' => 'Todo başlığı en az 3 karakter olmalıdır.',
            'title.max' => 'Todo başlığı en fazla 255 karakter olabilir.',
            'description.max' => 'Açıklama en fazla 2000 karakter olabilir.',
            'category_id.exists' => 'Seçilen kategori bulunamadı.',
            'category_id.integer' => 'Kategori ID geçerli bir sayı olmalıdır.',
            'completed.boolean' => 'Tamamlanma durumu true veya false olmalıdır.'
        ];
    }

    public function attributes(): array
    {
        return [
            'title' => 'Başlık',
            'description' => 'Açıklama',
            'category_id' => 'Kategori',
            'completed' => 'Tamamlanma Durumu'
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
        if ($this->has('title')) {
            $this->merge([
                'title' => trim($this->title),
            ]);
        }
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->filled('category_id')) {
                $category = \App\Models\Category::find($this->category_id);
                if ($category && !$category->is_active) {
                    $validator->errors()->add(
                        'category_id',
                        'Pasif kategoriye todo taşınamaz.'
                    );
                }
            }
        });
    }
}