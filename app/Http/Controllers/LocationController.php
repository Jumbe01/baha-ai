<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $validated = $request->validate([
            'address' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $request->user()->update($validated);

        return redirect()->route('dashboard')->with('status', 'Location updated.');
    }
}
