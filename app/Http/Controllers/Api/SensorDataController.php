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
        $reading = SensorReading::create([
            'sensor_id' => $sensor->id,
            ...$request->validated(),
            'recorded_at' => $request->validated('recorded_at', now()),
        ]);

        $sensor->update(['last_reading_at' => $reading->recorded_at]);

        $sensor->loadMissing('floodZone');
        $alert = $alertService->evaluateReading($sensor, $reading);

        return response()->json([
            'message' => 'Reading recorded successfully.',
            'reading' => $reading,
            'alert' => $alert,
        ], 201);
    }
}
