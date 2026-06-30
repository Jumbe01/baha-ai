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
