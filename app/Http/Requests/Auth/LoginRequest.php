<?php

namespace App\Http\Requests\Auth;

use App\Traits\JsonResponseTrait;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_code' => 'sometimes|required|string|max:20',
            'username' => 'required|string|max:255',
            'password' => 'required|string',
        ];
    }
}
