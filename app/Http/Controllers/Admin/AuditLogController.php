<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user:id,name,email')->latest('created_at');

        if ($action = $request->string('action')->toString()) {
            $query->where('action', $action);
        }

        if ($type = $request->string('type')->toString()) {
            $query->where('auditable_type', 'App\\Models\\'.$type);
        }

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('label', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $logs = $query->paginate(25)->withQueryString()
            ->through(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'subject_type' => $log->subject_type,
                'auditable_id' => $log->auditable_id,
                'label' => $log->label,
                'changes' => $log->changes,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at,
                'user' => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name] : null,
            ]);

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'type', 'search']),
            'types' => $this->auditedTypes(),
        ]);
    }

    /**
     * @return list<string>
     */
    private function auditedTypes(): array
    {
        return AuditLog::query()
            ->distinct()
            ->pluck('auditable_type')
            ->map(fn (string $type) => class_basename($type))
            ->sort()
            ->values()
            ->all();
    }
}
