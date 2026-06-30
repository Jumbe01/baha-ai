<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSensorReadingRequest;
use App\Models\Sensor;
use App\Models\SensorReading;
use Illuminate\Http\JsonResponse;

class SensorDataController extends Controller
{
    public function store(StoreSensorReadingRequest $request, Sensor $sensor): JsonResponse
    {
        $reading = SensorReading::create([
            'sensor_id' => $sensor->id,
            ...$request->validated(),
            'recorded_at' => $request->validated('recorded_at', now()),
        ]);

        $sensor->update(['last_reading_at' => $reading->recorded_at]);

        return response()->json([
            'message' => 'Reading recorded successfully.',
            'reading' => $reading,
        ], 201);
    }
}
