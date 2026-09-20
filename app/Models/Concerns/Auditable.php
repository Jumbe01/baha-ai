<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Records create / update / delete on a model into audit_logs.
 *
 * Seeders run inside WithoutModelEvents, so demo data does not pollute the
 * trail. Console commands and the scheduler write rows with a null user_id,
 * which reads as "the system did this".
 */
trait Auditable
{
    /**
     * Never store these, even when they change.
     *
     * @var list<string>
     */
    protected static array $auditRedacted = [
        'password', 'remember_token', 'api_token',
        'two_factor_secret', 'two_factor_recovery_codes',
    ];

    public static function bootAuditable(): void
    {
        static::created(fn (Model $model) => $model->writeAuditLog('created', [
            'after' => $model->auditSafe($model->getAttributes()),
        ]));

        static::updated(function (Model $model) {
            $changes = $model->auditSafe($model->getChanges());

            // Ignore touches that only moved updated_at.
            unset($changes['updated_at']);

            if ($changes === []) {
                return;
            }

            $model->writeAuditLog('updated', [
                'before' => $model->auditSafe(
                    array_intersect_key($model->getOriginal(), $changes)
                ),
                'after' => $changes,
            ]);
        });

        static::deleted(fn (Model $model) => $model->writeAuditLog('deleted', [
            'before' => $model->auditSafe($model->getAttributes()),
        ]));
    }

    /**
     * @param  array<string, mixed>  $changes
     */
    public function writeAuditLog(string $action, array $changes): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'auditable_type' => static::class,
            'auditable_id' => $this->getKey(),
            'label' => $this->auditLabel(),
            'changes' => $changes,
            'ip_address' => Request::ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * How this record should be named in the trail. Models can override.
     */
    public function auditLabel(): ?string
    {
        return $this->name ?? $this->title ?? null;
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    protected function auditSafe(array $attributes): array
    {
        foreach (static::$auditRedacted as $key) {
            if (array_key_exists($key, $attributes)) {
                $attributes[$key] = '[redacted]';
            }
        }

        return $attributes;
    }
}
