<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;

class SimulationController extends Controller
{
    /**
     * Trigger a storm simulation from the UI (staff/admin only). Generates
     * elevated readings through the alert pipeline for live demos.
     */
    public function storm(): RedirectResponse
    {
        Artisan::call('sensors:simulate', ['--storm' => true]);

        return redirect()->back()->with('success', 'Storm simulated — elevated readings generated and alerts dispatched.');
    }

    /**
     * Generate normal (safe) readings to reset the scene.
     */
    public function calm(): RedirectResponse
    {
        Artisan::call('sensors:simulate');

        return redirect()->back()->with('success', 'Normal readings generated — conditions back to baseline.');
    }
}
