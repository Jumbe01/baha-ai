<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\FloodZone;
use App\Models\Prediction;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Services\RiskLevelService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @phpstan-type RiskCounts array{safe: int, warning: int, critical: int, unknown: int}
 */
class DashboardController extends Controller
{
    public function __invoke(RiskLevelService $riskService): Response
    {
        $activeSensors = Sensor::where('status', 'active')->count();
        $totalSensors = Sensor::count();

        $latestReadings = Sensor::with(['floodZone', 'latestReading'])
            ->where('status', 'active')
            ->get();

        $riskCounts = ['safe' => 0, 'warning' => 0, 'critical' => 0, 'unknown' => 0];
        $highestWaterLevel = 0;
        $highestSensor = null;
        $highestZone = null;
        $highestRank = -1;
        $levelRank = ['unknown' => 0, 'safe' => 1, 'warning' => 2, 'critical' => 3];

        foreach ($latestReadings as $sensor) {
            $assessment = $riskService->assess($sensor);
            $riskCounts[$assessment['level']]++;

            // Feature the most at-risk station (then the highest level), not just
            // the deepest water: 1.1 m can be safe in one zone and critical in another.
            $rank = $levelRank[$assessment['level']] ?? 0;
            if ($sensor->latestReading && ($rank > $highestRank
                || ($rank === $highestRank && $sensor->latestReading->water_level > $highestWaterLevel))) {
                $highestRank = $rank;
                $highestWaterLevel = $sensor->latestReading->water_level;
                $highestSensor = $sensor->name;
                $highestZone = $sensor->floodZone;
            }
        }

        $avgTemperature = SensorReading::where('recorded_at', '>=', now()->subHours(6))
            ->avg('temperature');

        $avgHumidity = SensorReading::where('recorded_at', '>=', now()->subHours(6))
            ->avg('humidity');

        $totalRainfall = SensorReading::where('recorded_at', '>=', now()->subHours(24))
            ->avg('rainfall');

        // Worst risk among each active sensor's latest forecast from the last hour.
        $rank = ['safe' => 0, 'warning' => 1, 'critical' => 2];
        $predictionRisk = Prediction::whereIn('id', Prediction::selectRaw('MAX(id)')
            ->where('generated_at', '>=', now()->subHour())
            ->groupBy('sensor_id'))
            ->pluck('risk_level')
            ->sortByDesc(fn ($level) => $rank[$level] ?? 0)
            ->first();

        $floodZones = FloodZone::withCount('sensors')
            ->where('is_active', true)
            ->get()
            ->map(function ($zone) use ($riskService) {
                $latestReading = SensorReading::whereIn(
                    'sensor_id',
                    $zone->sensors()->pluck('id')
                )
                    ->orderBy('recorded_at', 'desc')
                    ->first();

                $waterLevel = $latestReading?->water_level ?? 0;
                $assessment = $riskService->forWaterLevel($waterLevel, $zone);

                return [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'barangay' => $zone->barangay,
                    'sensors_count' => $zone->sensors_count,
                    'water_level' => round($waterLevel, 2),
                    'risk' => $assessment,
                ];
            });

        $driver = DB::connection()->getDriverName();
        $hourExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m-%d %H:00:00', recorded_at)"
            : "DATE_TRUNC('hour', recorded_at)";

        $recentReadings = SensorReading::select(
            DB::raw("$hourExpr as hour"),
            DB::raw('AVG(water_level) as avg_water_level'),
            DB::raw('AVG(rainfall) as avg_rainfall'),
        )
            ->where('recorded_at', '>=', now()->subHours(24))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(fn ($r) => [
                'time' => $r->hour,
                'water_level' => round((float) $r->avg_water_level, 2),
                'rainfall' => round((float) $r->avg_rainfall, 2),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'activeSensors' => $activeSensors,
                'totalSensors' => $totalSensors,
                'riskCounts' => $riskCounts,
                'highestWaterLevel' => round($highestWaterLevel, 2),
                'highestSensor' => $highestSensor,
                'avgTemperature' => $avgTemperature ? round($avgTemperature, 1) : null,
                'avgHumidity' => $avgHumidity ? round($avgHumidity, 1) : null,
                'totalRainfall' => $totalRainfall ? round($totalRainfall, 1) : null,
                'activeAlerts' => Alert::active()->count(),
                'predictionRisk' => $predictionRisk,
                // The gauge must use the thresholds of the zone it is showing.
                'highestWarning' => $highestZone ? (float) $highestZone->warning_threshold : null,
                'highestCritical' => $highestZone ? (float) $highestZone->critical_threshold : null,
            ],
            'floodZones' => $floodZones,
            'recentReadings' => $recentReadings,
        ]);
    }
}
