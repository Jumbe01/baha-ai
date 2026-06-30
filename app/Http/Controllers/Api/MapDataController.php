<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FloodZone;
use App\Models\Sensor;
use App\Services\RiskLevelService;
use Illuminate\Http\JsonResponse;

class MapDataController extends Controller
{
    /**
     * Return flood zone polygons as a GeoJSON FeatureCollection, color-coded
     * by current risk level for client-side MapLibre styling.
     */
    public function geojson(RiskLevelService $riskService): JsonResponse
    {
        $zones = FloodZone::with('sensors.latestReading')
            ->where('is_active', true)
            ->get();

        $features = $zones->map(function (FloodZone $zone) use ($riskService) {
            $highestLevel = 0.0;

            foreach ($zone->sensors as $sensor) {
                $level = (float) ($sensor->latestReading?->water_level ?? 0);
                $highestLevel = max($highestLevel, $level);
            }

            $assessment = $riskService->forWaterLevel($highestLevel, $zone);

            // GeoJSON expects [lng, lat] order; polygon ring must be closed.
            $ring = collect($zone->coordinates)
                ->map(fn ($point) => [(float) $point['lng'], (float) $point['lat']])
                ->all();

            return [
                'type' => 'Feature',
                'properties' => [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'barangay' => $zone->barangay,
                    'risk' => $assessment['level'],
                    'water_level' => round($highestLevel, 2),
                    'warning_threshold' => (float) $zone->warning_threshold,
                    'critical_threshold' => (float) $zone->critical_threshold,
                ],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [$ring],
                ],
            ];
        })->all();

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    /**
     * Return sensor locations with latest readings as a GeoJSON
     * FeatureCollection for marker rendering.
     */
    public function sensors(RiskLevelService $riskService): JsonResponse
    {
        $sensors = Sensor::with(['floodZone', 'latestReading'])
            ->where('status', 'active')
            ->get();

        $features = $sensors->map(function (Sensor $sensor) use ($riskService) {
            $assessment = $riskService->assess($sensor);

            return [
                'type' => 'Feature',
                'properties' => [
                    'id' => $sensor->id,
                    'name' => $sensor->name,
                    'type' => $sensor->type,
                    'flood_zone' => $sensor->floodZone->name,
                    'barangay' => $sensor->floodZone->barangay,
                    'water_level' => (float) ($sensor->latestReading?->water_level ?? 0),
                    'risk' => $assessment['level'],
                    'last_reading_at' => $sensor->latestReading?->recorded_at?->toIso8601String(),
                ],
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => [(float) $sensor->longitude, (float) $sensor->latitude],
                ],
            ];
        })->all();

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }
}
