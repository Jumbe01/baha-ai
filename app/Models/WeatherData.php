<?php

namespace App\Models;

use Database\Factories\WeatherDataFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'location', 'latitude', 'longitude', 'temperature', 'feels_like',
    'humidity', 'rainfall', 'wind_speed', 'condition', 'description',
    'icon', 'forecast', 'fetched_at',
])]
class WeatherData extends Model
{
    /** @use HasFactory<WeatherDataFactory> */
    use HasFactory;

    protected $table = 'weather_data';

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'temperature' => 'decimal:2',
            'feels_like' => 'decimal:2',
            'rainfall' => 'decimal:2',
            'wind_speed' => 'decimal:2',
            'forecast' => 'array',
            'fetched_at' => 'datetime',
        ];
    }
}
