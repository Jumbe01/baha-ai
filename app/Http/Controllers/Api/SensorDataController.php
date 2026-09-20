<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSensorReadingRequest;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Services\AlertService;
use Illuminate\Http\JsonResponse;

class SensorDataController extends Controller
{
    public function store(StoreSensorReadingRequest $request, Sensor $sensor, AlertService $alertService): JsonResponse
    {
        $data = $request->validated();

        // battery_level belongs to the device, not to an individual reading,
        // so it is split out before the reading row is created.
        $battery = $data['battery_level'] ?? null;
        unset($data['battery_level']);

        $reading = SensorReading::create([
            'sensor_id' => $sensor->id,
            ...$data,
            'recorded_at' => $data['recorded_at'] ?? now(),
        ]);

        $attributes = [
            'last_reading_at' => $reading->recorded_at,
            // A device that just reported is, by definition, back online.
            'status' => $sensor->status === 'maintenance' ? 'maintenance' : 'active',
        ];

        if ($battery !== null) {
            $attributes['battery_level'] = $battery;
        }

        $sensor->update($attributes);

        $sensor->loadMissing('floodZone');
        $alert = $alertService->evaluateReading($sensor, $reading);

        return response()->json([
            'message' => 'Reading recorded successfully.',
            'reading' => $reading,
            'alert' => $alert,
        ], 201);
    }
}
