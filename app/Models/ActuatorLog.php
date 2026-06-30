<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'actuator_device_id', 'user_id', 'action', 'trigger', 'notes', 'logged_at',
])]
class ActuatorLog extends Model
{
    protected function casts(): array
    {
        return [
            'logged_at' => 'datetime',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(ActuatorDevice::class, 'actuator_device_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
