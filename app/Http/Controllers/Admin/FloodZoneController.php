<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFloodZoneRequest;
use App\Http\Requests\Admin\UpdateFloodZoneRequest;
use App\Models\FloodZone;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FloodZoneController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/FloodZones/Index', [
            'floodZones' => FloodZone::withCount('sensors')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/FloodZones/Create');
    }

    public function store(StoreFloodZoneRequest $request): RedirectResponse
    {
        FloodZone::create($request->validated());

        return redirect()->route('admin.flood-zones.index')
            ->with('success', 'Flood zone created successfully.');
    }

    public function edit(FloodZone $floodZone): Response
    {
        return Inertia::render('Admin/FloodZones/Edit', [
            'floodZone' => $floodZone,
        ]);
    }

    public function update(UpdateFloodZoneRequest $request, FloodZone $floodZone): RedirectResponse
    {
        $floodZone->update($request->validated());

        return redirect()->route('admin.flood-zones.index')
            ->with('success', 'Flood zone updated successfully.');
    }

    public function destroy(FloodZone $floodZone): RedirectResponse
    {
        $floodZone->delete();

        return redirect()->route('admin.flood-zones.index')
            ->with('success', 'Flood zone deleted successfully.');
    }
}
