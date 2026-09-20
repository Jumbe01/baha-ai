<?php

namespace App\Http\Controllers;

use App\Models\ActuatorDevice;
use App\Models\ActuatorLog;
use App\Services\ActuatorSimulationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActuatorController extends Controller
{
    public function index(): Response
    {
        $devices = ActuatorDevice::with('floodZone:id,name')
            ->orderBy('name')
            ->get();

        $logs = ActuatorLog::with(['device:id,name', 'user:id,name'])
            ->latest('logged_at')
            ->limit(30)
            ->get();

        return Inertia::render('Actuation/Index', [
            'devices' => $devices,
            'logs' => $logs,
        ]);
    }

    public function toggle(ActuatorDevice $device, Request $request, ActuatorSimulationService $service): RedirectResponse
    {
        // The UI hides manual control for auto-mode devices; enforce it here too
        // so a direct PATCH cannot fight the automation.
        if ($device->mode === 'auto') {
            return redirect()->back()->with(
                'error',
                "{$device->name} is in automatic mode. Switch it to manual to control it directly.",
            );
        }

        $service->toggle($device, $request->user()->id);

        return redirect()->back()->with('success', "Device {$device->name} toggled.");
    }

    public function switchMode(ActuatorDevice $device, Request $request, ActuatorSimulationService $service): RedirectResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'in:auto,manual'],
        ]);

        $service->switchMode($device, $validated['mode'], $request->user()->id);

        return redirect()->back()->with('success', "Device {$device->name} switched to {$validated['mode']} mode.");
    }
}
