<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = auth()->user()->company_id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where(function ($query) use ($companyId) {
                    $query->where('company_id', $companyId)
                          ->where('name', '!=', 'Super Admin');
                }),
            ],
        ];
    }
}
