<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Inertia\Inertia;
use Inertia\Response;

class WeatherController extends Controller
{
    public function index(WeatherService $weatherService): Response
    {
        $weather = $weatherService->current();

        return Inertia::render('Weather/Index', [
            'weather' => $weather,
            'usingSimulatedData' => empty(config('services.openweathermap.key')),
        ]);
    }
}
