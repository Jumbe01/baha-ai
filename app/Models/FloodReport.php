<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'barangay', 'severity', 'description',
    'latitude', 'longitude', 'status',
])]
class FloodReport extends Model
{
    use Auditable;

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditLabel(): ?string
    {
        return sprintf('%s report in %s', $this->severity, $this->barangay ?? 'unknown barangay');
    }
}
