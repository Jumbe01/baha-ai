<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvacuationCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'flood_zone_id' => ['nullable', 'exists:flood_zones,id'],
            'name' => ['required', 'string', 'max:255'],
            'barangay' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:1'],
            'current_occupancy' => ['nullable', 'integer', 'min:0', 'lte:capacity'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'contact_number' => ['nullable', 'string', 'max:32'],
            'status' => ['required', 'in:open,full,closed'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_occupancy.lte' => 'Occupancy cannot exceed the centre capacity.',
        ];
    }
}
