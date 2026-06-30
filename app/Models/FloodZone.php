<?php

namespace App\Models;

use Database\Factories\FloodZoneFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'description', 'barangay', 'safe_threshold',
    'warning_threshold', 'critical_threshold', 'coordinates',
    'risk_level', 'is_active',
])]
class FloodZone extends Model
{
    /** @use HasFactory<FloodZoneFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'coordinates' => 'array',
            'safe_threshold' => 'decimal:2',
            'warning_threshold' => 'decimal:2',
            'critical_threshold' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function sensors(): HasMany
    {
        return $this->hasMany(Sensor::class);
    }

    public function getRiskLevelForWaterLevel(float $waterLevel): string
    {
        if ($waterLevel >= $this->critical_threshold) {
            return 'critical';
        }

        if ($waterLevel >= $this->warning_threshold) {
            return 'warning';
        }

        return 'safe';
    }
}
