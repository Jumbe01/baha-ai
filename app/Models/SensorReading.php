<?php

namespace App\Models;

use Database\Factories\SensorReadingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'sensor_id', 'water_level', 'rainfall', 'temperature',
    'humidity', 'is_simulated', 'recorded_at',
])]
class SensorReading extends Model
{
    /** @use HasFactory<SensorReadingFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'water_level' => 'decimal:2',
            'rainfall' => 'decimal:2',
            'temperature' => 'decimal:2',
            'humidity' => 'decimal:2',
            'is_simulated' => 'boolean',
            'recorded_at' => 'datetime',
        ];
    }

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class);
    }
}
