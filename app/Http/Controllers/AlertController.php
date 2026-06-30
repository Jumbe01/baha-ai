<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlertRequest;
use App\Models\Alert;
use App\Models\FloodZone;
use App\Services\AlertService;
use App\Services\NotificationDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Alert::with(['floodZone:id,name,barangay', 'sensor:id,name'])
            ->withCount('recipients');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->input('severity'));
        }

        if ($request->filled('flood_zone_id')) {
            $query->where('flood_zone_id', $request->input('flood_zone_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $alerts = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Alerts/Index', [
            'alerts' => $alerts,
            'floodZones' => FloodZone::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['status', 'severity', 'flood_zone_id', 'search']),
        ]);
    }

    public function show(Alert $alert): Response
    {
        $alert->load([
            'floodZone',
            'sensor',
            'creator:id,name',
            'resolver:id,name',
            'recipients.user:id,name,barangay',
            'notificationLogs.user:id,name',
        ]);

        return Inertia::render('Alerts/Show', [
            'alert' => $alert,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Alerts/Create', [
            'floodZones' => FloodZone::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreAlertRequest $request, NotificationDispatcher $dispatcher): RedirectResponse
    {
        $alert = Alert::create([
            ...$request->validated(),
            'status' => 'active',
            'source' => 'manual',
            'created_by' => $request->user()->id,
        ]);

        $alert->loadMissing('floodZone');
        $dispatcher->dispatch($alert);

        return redirect()->route('alerts.index')
            ->with('success', 'Alert created and notifications dispatched.');
    }

    public function resolve(Alert $alert, Request $request, AlertService $alertService): RedirectResponse
    {
        $alertService->resolve($alert, $request->user()->id);

        return redirect()->back()->with('success', 'Alert resolved.');
    }
}
