<?php

namespace App\Http\Controllers;

use App\Models\FloodZone;
use App\Services\RiskLevelService;
use Inertia\Inertia;
use Inertia\Response;

class GpsAlertController extends Controller
{
    public function index(RiskLevelService $riskService): Response
    {
        $zones = FloodZone::with('sensors.latestReading')
            ->where('is_active', true)
            ->get();

        $floodedZones = $zones->filter(function (FloodZone $zone) use ($riskService) {
            $highest = 0.0;
            foreach ($zone->sensors as $sensor) {
                $highest = max($highest, (float) ($sensor->latestReading?->water_level ?? 0));
            }
            $assessment = $riskService->forWaterLevel($highest, $zone);

            return $assessment['level'] !== 'safe';
        })->map(function (FloodZone $zone) use ($riskService) {
            $highest = 0.0;
            foreach ($zone->sensors as $sensor) {
                $highest = max($highest, (float) ($sensor->latestReading?->water_level ?? 0));
            }

            $center = $this->centroid($zone->coordinates);

            return [
                'id' => $zone->id,
                'name' => $zone->name,
                'barangay' => $zone->barangay,
                'risk' => $riskService->forWaterLevel($highest, $zone)['level'],
                'water_level' => round($highest, 2),
                'center' => $center,
                'evacuation_route' => $this->evacuationRoute($center),
            ];
        })->values();

        return Inertia::render('GpsAlerts/Index', [
            'center' => ['lat' => 10.3667, 'lng' => 123.9567],
            'floodedZones' => $floodedZones,
            'evacuationCenter' => ['lat' => 10.3760, 'lng' => 123.9540, 'name' => 'Consolacion Sports Complex'],
        ]);
    }

    /**
     * @param  array<int, array{lat: float|string, lng: float|string}>  $coordinates
     * @return array{lat: float, lng: float}
     */
    private function centroid(array $coordinates): array
    {
        $count = count($coordinates);

        if ($count === 0) {
            return ['lat' => 10.3667, 'lng' => 123.9567];
        }

        $sumLat = array_sum(array_map(fn ($c) => (float) $c['lat'], $coordinates));
        $sumLng = array_sum(array_map(fn ($c) => (float) $c['lng'], $coordinates));

        return [
            'lat' => round($sumLat / $count, 7),
            'lng' => round($sumLng / $count, 7),
        ];
    }

    /**
     * Build a simple two-point evacuation route from a flooded zone centroid
     * to the designated evacuation center.
     *
     * @param  array{lat: float, lng: float}  $from
     * @return array<int, array{lat: float, lng: float}>
     */
    private function evacuationRoute(array $from): array
    {
        return [
            $from,
            ['lat' => 10.3760, 'lng' => 123.9540],
        ];
    }
}
