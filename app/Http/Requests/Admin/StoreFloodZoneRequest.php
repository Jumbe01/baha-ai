<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreFloodZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'barangay' => ['required', 'string', 'max:255'],
            'safe_threshold' => ['required', 'numeric', 'min:0'],
            'warning_threshold' => ['required', 'numeric', 'gt:safe_threshold'],
            'critical_threshold' => ['required', 'numeric', 'gt:warning_threshold'],
            'coordinates' => ['required', 'array', 'min:4'],
            'coordinates.*.lat' => ['required', 'numeric', 'between:-90,90'],
            'coordinates.*.lng' => ['required', 'numeric', 'between:-180,180'],
        ];
    }
}
