<?php

namespace App\Http\Controllers;

use App\Models\Prediction;
use App\Models\Sensor;
use App\Services\PredictionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PredictionController extends Controller
{
    public function index(): Response
    {
        $sensors = Sensor::with('floodZone:id,name,barangay,warning_threshold,critical_threshold')
            ->where('status', 'active')
            ->get();

        $predictions = $sensors->map(function (Sensor $sensor) {
            $prediction = Prediction::where('sensor_id', $sensor->id)
                ->latest('generated_at')
                ->first();

            return [
                'sensor' => [
                    'id' => $sensor->id,
                    'name' => $sensor->name,
                    'flood_zone' => $sensor->floodZone->name,
                    'barangay' => $sensor->floodZone->barangay,
                    'critical_threshold' => (float) $sensor->floodZone->critical_threshold,
                ],
                'prediction' => $prediction,
            ];
        })->values();

        return Inertia::render('Predictions/Index', [
            'predictions' => $predictions,
        ]);
    }

    public function generate(PredictionService $service): RedirectResponse
    {
        $sensors = Sensor::with('floodZone')->where('status', 'active')->get();
        $generated = 0;

        foreach ($sensors as $sensor) {
            if ($service->generate($sensor)) {
                $generated++;
            }
        }

        return redirect()->route('predictions.index')
            ->with('success', "Generated {$generated} prediction(s).");
    }
}
