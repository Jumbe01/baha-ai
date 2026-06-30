<?php

namespace App\Models;

use Database\Factories\FloodIncidentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'flood_zone_id', 'severity', 'peak_water_level', 'total_rainfall',
    'duration_minutes', 'affected_residents', 'description', 'occurred_at',
])]
class FloodIncident extends Model
{
    /** @use HasFactory<FloodIncidentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'peak_water_level' => 'decimal:2',
            'total_rainfall' => 'decimal:2',
            'occurred_at' => 'datetime',
        ];
    }

    public function floodZone(): BelongsTo
    {
        return $this->belongsTo(FloodZone::class);
    }
}
