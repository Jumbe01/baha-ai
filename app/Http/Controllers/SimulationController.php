<?php

namespace App\Http\Controllers;

use Illuminate\Console\Command;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

class SimulationController extends Controller
{
    /**
     * Trigger a storm simulation from the UI (staff/admin only). Generates
     * elevated readings through the alert pipeline for live demos.
     */
    public function storm(): RedirectResponse
    {
        return $this->simulate(['--storm' => true]);
    }

    /**
     * Generate normal (safe) readings and close the simulated alerts.
     */
    public function calm(): RedirectResponse
    {
        return $this->simulate([]);
    }

    private function simulate(array $options): RedirectResponse
    {
        $code = Artisan::call('sensors:simulate', $options);
        $summary = Str::of(Artisan::output())->trim()->explode("\n")->last();

        if ($code !== Command::SUCCESS) {
            return back()->with('error', trim($summary) ?: 'Simulation failed.');
        }

        // Refresh forecasts now so the prediction screens follow the demo
        // instead of waiting for the 15-minute schedule.
        Artisan::call('predictions:generate');

        return back()->with('success', trim($summary));
    }
}
