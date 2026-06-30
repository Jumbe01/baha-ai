<?php

use App\Http\Controllers\Api\SensorDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/sensors/{sensor}/readings', [SensorDataController::class, 'store'])
    ->name('api.sensor-readings.store');
