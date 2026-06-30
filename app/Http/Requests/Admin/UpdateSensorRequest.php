<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSensorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'flood_zone_id' => ['required', 'exists:flood_zones,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:ultrasonic,rain_gauge,pressure'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'status' => ['required', 'string', 'in:active,inactive,maintenance'],
        ];
    }
}
