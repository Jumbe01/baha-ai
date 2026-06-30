<?php

namespace App\Models;

use Database\Factories\ActuatorDeviceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'flood_zone_id', 'name', 'type', 'latitude', 'longitude',
    'is_on', 'mode', 'status', 'last_activated_at',
])]
class ActuatorDevice extends Model
{
    /** @use HasFactory<ActuatorDeviceFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_on' => 'boolean',
            'last_activated_at' => 'datetime',
        ];
    }

    public function floodZone(): BelongsTo
    {
        return $this->belongsTo(FloodZone::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ActuatorLog::class);
    }
}
