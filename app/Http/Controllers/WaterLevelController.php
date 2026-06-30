<?php

namespace App\Http\Controllers;

use App\Models\Sensor;
use App\Models\SensorReading;
use App\Services\RiskLevelService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaterLevelController extends Controller
{
    public function index(RiskLevelService $riskService): Response
    {
        $sensors = Sensor::with(['floodZone', 'latestReading'])
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn ($sensor) => [
                'id' => $sensor->id,
                'name' => $sensor->name,
                'type' => $sensor->type,
                'flood_zone' => $sensor->floodZone->name,
                'barangay' => $sensor->floodZone->barangay,
                'water_level' => (float) ($sensor->latestReading?->water_level ?? 0),
                'rainfall' => (float) ($sensor->latestReading?->rainfall ?? 0),
                'temperature' => $sensor->latestReading?->temperature !== null ? (float) $sensor->latestReading->temperature : null,
                'humidity' => $sensor->latestReading?->humidity !== null ? (float) $sensor->latestReading->humidity : null,
                'last_reading_at' => $sensor->latestReading?->recorded_at,
                'risk' => $riskService->assess($sensor),
                'thresholds' => [
                    'safe' => (float) $sensor->floodZone->safe_threshold,
                    'warning' => (float) $sensor->floodZone->warning_threshold,
                    'critical' => (float) $sensor->floodZone->critical_threshold,
                ],
            ]);

        return Inertia::render('WaterLevels/Index', [
            'sensors' => $sensors,
        ]);
    }

    public function show(Request $request, Sensor $sensor, RiskLevelService $riskService): Response
    {
        $sensor->load('floodZone');

        $hours = (int) $request->input('hours', 24);
        $hours = min(max($hours, 1), 168);

        $readings = SensorReading::where('sensor_id', $sensor->id)
            ->where('recorded_at', '>=', now()->subHours($hours))
            ->orderBy('recorded_at')
            ->get()
            ->map(fn ($r) => [
                'time' => $r->recorded_at->format('Y-m-d H:i'),
                'water_level' => (float) $r->water_level,
                'rainfall' => (float) $r->rainfall,
                'temperature' => (float) $r->temperature,
                'humidity' => (float) $r->humidity,
            ]);

        return Inertia::render('WaterLevels/Show', [
            'sensor' => [
                'id' => $sensor->id,
                'name' => $sensor->name,
                'type' => $sensor->type,
                'latitude' => $sensor->latitude,
                'longitude' => $sensor->longitude,
                'flood_zone' => $sensor->floodZone->name,
                'barangay' => $sensor->floodZone->barangay,
                'water_level' => (float) ($sensor->latestReading?->water_level ?? 0),
                'risk' => $riskService->assess($sensor),
                'thresholds' => [
                    'safe' => (float) $sensor->floodZone->safe_threshold,
                    'warning' => (float) $sensor->floodZone->warning_threshold,
                    'critical' => (float) $sensor->floodZone->critical_threshold,
                ],
            ],
            'readings' => $readings,
            'hours' => $hours,
        ]);
    }
}
