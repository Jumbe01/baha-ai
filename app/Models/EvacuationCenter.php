<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Database\Factories\EvacuationCenterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'flood_zone_id', 'name', 'barangay', 'address', 'capacity',
    'current_occupancy', 'latitude', 'longitude', 'contact_number',
    'status', 'is_active',
])]
class EvacuationCenter extends Model
{
    /** @use HasFactory<EvacuationCenterFactory> */
    use Auditable, HasFactory;

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_active' => 'boolean',
        ];
    }

    public function floodZone(): BelongsTo
    {
        return $this->belongsTo(FloodZone::class);
    }

    /**
     * Centres that can still take people.
     *
     * @param  Builder<EvacuationCenter>  $query
     */
    public function scopeAvailable(Builder $query): void
    {
        $query->where('is_active', true)->where('status', 'open');
    }

    public function getSpacesRemainingAttribute(): int
    {
        return max(0, $this->capacity - $this->current_occupancy);
    }

    public function getOccupancyPercentAttribute(): int
    {
        if ($this->capacity <= 0) {
            return 0;
        }

        return (int) min(100, round($this->current_occupancy / $this->capacity * 100));
    }

    /**
     * Straight-line distance in kilometres, used to pick the nearest centre.
     * Good enough for ranking shelters in a municipality-sized area.
     */
    public function distanceFrom(float $latitude, float $longitude): float
    {
        $earthRadius = 6371;

        $dLat = deg2rad((float) $this->latitude - $latitude);
        $dLng = deg2rad((float) $this->longitude - $longitude);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($latitude)) * cos(deg2rad((float) $this->latitude)) * sin($dLng / 2) ** 2;

        return round($earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a)), 3);
    }
}
