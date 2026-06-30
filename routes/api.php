<?php

use App\Http\Controllers\Api\MapDataController;
use App\Http\Controllers\Api\SensorDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/sensors/{sensor}/readings', [SensorDataController::class, 'store'])
    ->name('api.sensor-readings.store');

Route::get('/map/geojson', [MapDataController::class, 'geojson'])->name('api.map.geojson');
Route::get('/map/sensors', [MapDataController::class, 'sensors'])->name('api.map.sensors');
