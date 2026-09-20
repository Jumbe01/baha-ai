<?php

namespace App\Http\Controllers;

use App\Models\EvacuationCenter;
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
            $shelter = $this->nearestShelter($center);

            return [
                'id' => $zone->id,
                'name' => $zone->name,
                'barangay' => $zone->barangay,
                'risk' => $riskService->forWaterLevel($highest, $zone)['level'],
                'water_level' => round($highest, 2),
                'center' => $center,
                'evacuation_center' => $shelter ? [
                    'id' => $shelter->id,
                    'name' => $shelter->name,
                    'lat' => (float) $shelter->latitude,
                    'lng' => (float) $shelter->longitude,
                    'spaces_remaining' => $shelter->spaces_remaining,
                    'distance_km' => $shelter->distanceFrom($center['lat'], $center['lng']),
                ] : null,
                'evacuation_route' => $this->evacuationRoute($center, $shelter),
            ];
        })->values();

        $primary = EvacuationCenter::available()->first();

        return Inertia::render('GpsAlerts/Index', [
            'center' => ['lat' => 10.3667, 'lng' => 123.9567],
            'floodedZones' => $floodedZones,
            'evacuationCenter' => $primary ? [
                'lat' => (float) $primary->latitude,
                'lng' => (float) $primary->longitude,
                'name' => $primary->name,
            ] : null,
        ]);
    }

    /**
     * The closest shelter that still has room, measured from a zone centroid.
     *
     * @param  array{lat: float, lng: float}  $from
     */
    private function nearestShelter(array $from): ?EvacuationCenter
    {
        return EvacuationCenter::available()
            ->get()
            ->sortBy(fn (EvacuationCenter $center) => $center->distanceFrom($from['lat'], $from['lng']))
            ->first();
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
     * A direct line from the flooded zone centroid to its nearest shelter.
     *
     * This is a straight-line heading, not a road route — there is no routing
     * engine behind it, and the UI labels it as a direction indicator.
     *
     * @param  array{lat: float, lng: float}  $from
     * @return array<int, array{lat: float, lng: float}>
     */
    private function evacuationRoute(array $from, ?EvacuationCenter $shelter): array
    {
        if (! $shelter) {
            return [];
        }

        return [
            $from,
            ['lat' => (float) $shelter->latitude, 'lng' => (float) $shelter->longitude],
        ];
    }
}
