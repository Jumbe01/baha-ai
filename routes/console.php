<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('weather:fetch')->hourly();
Schedule::command('predictions:generate')->everyFifteenMinutes();
Schedule::command('sensors:check-offline')->everyFifteenMinutes();
