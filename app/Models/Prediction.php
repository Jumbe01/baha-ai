<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'sensor_id', 'flood_zone_id', 'current_level', 'rate_of_rise',
    'predicted_level', 'minutes_to_critical', 'confidence', 'risk_level',
    'recommendation', 'forecast_points', 'generated_at',
])]
class Prediction extends Model
{
    protected function casts(): array
    {
        return [
            'current_level' => 'decimal:2',
            'rate_of_rise' => 'decimal:4',
            'predicted_level' => 'decimal:2',
            'confidence' => 'decimal:2',
            'forecast_points' => 'array',
            'generated_at' => 'datetime',
        ];
    }

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class);
    }

    public function floodZone(): BelongsTo
    {
        return $this->belongsTo(FloodZone::class);
    }
}
