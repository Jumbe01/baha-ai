<?php

namespace App\Http\Controllers;

use App\Models\FloodReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FloodReportController extends Controller
{
    /**
     * Store a community flood report submitted by a resident.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'severity' => 'required|string|in:minor,moderate,severe',
            'description' => 'required|string|max:1000',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        FloodReport::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'barangay' => $request->user()->barangay,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Thank you — your flood report has been submitted to local authorities.');
    }
}
