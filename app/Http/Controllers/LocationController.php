<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    /**
     * Show the location onboarding / selection screen.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Location/Select', [
            'current' => [
                'address' => $user->address,
                'barangay' => $user->barangay,
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
            ],
        ]);
    }

    /**
     * Persist the selected location for the authenticated user.
     */
    public function update(Request $request): RedirectResponse
    {
        $b = config('consolacion.bounds');
        $validated = $request->validate([
            'address' => 'nullable|string|max:255',
            'barangay' => ['nullable', Rule::in(config('consolacion.barangays'))],
            'latitude' => "nullable|numeric|between:{$b['lat_min']},{$b['lat_max']}",
            'longitude' => "nullable|numeric|between:{$b['lng_min']},{$b['lng_max']}",
        ], [
            'barangay.in' => 'BahaAI currently serves residents of Consolacion only.',
            'latitude.between' => 'Your detected location is outside Consolacion.',
            'longitude.between' => 'Your detected location is outside Consolacion.',
        ]);

        $request->user()->update($validated);

        return redirect()->route('dashboard')->with('status', 'Location updated.');
    }
}
