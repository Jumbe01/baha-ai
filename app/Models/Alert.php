<?php

namespace App\Models;

use Database\Factories\AlertFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'flood_zone_id', 'sensor_id', 'severity', 'title', 'message',
    'water_level', 'status', 'source', 'created_by', 'resolved_by', 'resolved_at',
])]
class Alert extends Model
{
    /** @use HasFactory<AlertFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'water_level' => 'decimal:2',
            'resolved_at' => 'datetime',
        ];
    }

    public function floodZone(): BelongsTo
    {
        return $this->belongsTo(FloodZone::class);
    }

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(AlertRecipient::class);
    }

    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * @param  Builder<Alert>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 'active');
    }

    /**
     * @param  Builder<Alert>  $query
     */
    public function scopeResolved(Builder $query): void
    {
        $query->where('status', 'resolved');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
