<?php

namespace App\Http\Controllers;

use App\Models\FloodReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FloodReportController extends Controller
{
    /**
     * Staff-facing list of community flood reports.
     */
    public function index(Request $request): Response
    {
        $query = FloodReport::with('user:id,name')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $reports = $query->paginate(15)->withQueryString();

        return Inertia::render('FloodReports/Index', [
            'reports' => $reports,
            'filters' => $request->only('status'),
            'counts' => [
                'pending' => FloodReport::where('status', 'pending')->count(),
                'reviewed' => FloodReport::where('status', 'reviewed')->count(),
                'resolved' => FloodReport::where('status', 'resolved')->count(),
            ],
        ]);
    }

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

    /**
     * Update the review status of a report (staff only).
     */
    public function updateStatus(Request $request, FloodReport $floodReport): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,reviewed,resolved',
        ]);

        $floodReport->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', "Report marked as {$validated['status']}.");
    }
}
