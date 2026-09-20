<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'user_id', 'action', 'auditable_type', 'auditable_id',
    'label', 'changes', 'ip_address', 'created_at',
])]
class AuditLog extends Model
{
    /**
     * Audit rows are written once and never modified, so a single
     * created_at is the whole story.
     */
    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'changes' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Short class name for display, e.g. "FloodZone" rather than the FQCN.
     */
    public function getSubjectTypeAttribute(): string
    {
        return class_basename($this->auditable_type);
    }
}
