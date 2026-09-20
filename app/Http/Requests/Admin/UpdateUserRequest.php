<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],
            'role' => ['required', 'in:admin,staff,resident'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'barangay' => ['nullable', 'string', 'max:255'],
            // Optional on update — leave blank to keep the current password.
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ];
    }
}
