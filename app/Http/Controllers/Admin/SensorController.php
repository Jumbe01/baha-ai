<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSensorRequest;
use App\Http\Requests\Admin\UpdateSensorRequest;
use App\Models\FloodZone;
use App\Models\Sensor;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SensorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Sensors/Index', [
            'sensors' => Sensor::with(['floodZone:id,name', 'latestReading'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Sensors/Create', [
            'floodZones' => FloodZone::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreSensorRequest $request): RedirectResponse
    {
        Sensor::create($request->validated());

        return redirect()->route('admin.sensors.index')
            ->with('success', 'Sensor created successfully.');
    }

    public function edit(Sensor $sensor): Response
    {
        return Inertia::render('Admin/Sensors/Edit', [
            'sensor' => $sensor->load('floodZone:id,name'),
            'floodZones' => FloodZone::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateSensorRequest $request, Sensor $sensor): RedirectResponse
    {
        $sensor->update($request->validated());

        return redirect()->route('admin.sensors.index')
            ->with('success', 'Sensor updated successfully.');
    }

    public function destroy(Sensor $sensor): RedirectResponse
    {
        $sensor->delete();

        return redirect()->route('admin.sensors.index')
            ->with('success', 'Sensor deleted successfully.');
    }
}
