<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEvacuationCenterRequest;
use App\Http\Requests\Admin\UpdateEvacuationCenterRequest;
use App\Models\EvacuationCenter;
use App\Models\FloodZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class EvacuationCenterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/EvacuationCenters/Index', [
            'centers' => EvacuationCenter::with('floodZone:id,name')
                ->orderBy('barangay')
                ->orderBy('name')
                ->get()
                ->append(['spaces_remaining', 'occupancy_percent']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/EvacuationCenters/Create', [
            'floodZones' => $this->zoneOptions(),
        ]);
    }

    public function store(StoreEvacuationCenterRequest $request): RedirectResponse
    {
        EvacuationCenter::create($request->validated());

        return redirect()->route('admin.evacuation-centers.index')
            ->with('success', 'Evacuation center created successfully.');
    }

    public function edit(EvacuationCenter $evacuationCenter): Response
    {
        return Inertia::render('Admin/EvacuationCenters/Edit', [
            'center' => $evacuationCenter,
            'floodZones' => $this->zoneOptions(),
        ]);
    }

    public function update(UpdateEvacuationCenterRequest $request, EvacuationCenter $evacuationCenter): RedirectResponse
    {
        $evacuationCenter->update($request->validated());

        return redirect()->route('admin.evacuation-centers.index')
            ->with('success', 'Evacuation center updated successfully.');
    }

    public function destroy(EvacuationCenter $evacuationCenter): RedirectResponse
    {
        $evacuationCenter->delete();

        return redirect()->route('admin.evacuation-centers.index')
            ->with('success', 'Evacuation center deleted successfully.');
    }

    /**
     * @return Collection<int, FloodZone>
     */
    private function zoneOptions()
    {
        return FloodZone::orderBy('name')->get(['id', 'name', 'barangay']);
    }
}
