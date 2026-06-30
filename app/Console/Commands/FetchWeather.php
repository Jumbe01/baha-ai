<?php

namespace App\Console\Commands;

use App\Services\WeatherService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('weather:fetch')]
#[Description('Fetch and cache the latest weather data for Consolacion')]
class FetchWeather extends Command
{
    public function handle(WeatherService $weatherService): int
    {
        $weather = $weatherService->fetch();

        $this->info(sprintf(
            'Weather fetched: %s, %s°C, %smm rain.',
            $weather->condition,
            $weather->temperature,
            $weather->rainfall,
        ));

        return self::SUCCESS;
    }
}
