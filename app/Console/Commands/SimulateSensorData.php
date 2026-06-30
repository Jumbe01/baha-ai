<?php

namespace App\Console\Commands;

use App\Models\Sensor;
use App\Models\SensorReading;
use App\Services\AlertService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('sensors:simulate {--storm : Generate elevated readings to trigger alerts} {--sensor= : Limit to a specific sensor ID}')]
#[Description('Generate live sensor readings through the alert evaluation pipeline for demos')]
class SimulateSensorData extends Command
{
    public function handle(AlertService $alertService): int
    {
        $query = Sensor::with('floodZone')->where('status', 'active');

        if ($sensorId = $this->option('sensor')) {
            $query->where('id', $sensorId);
        }

        $sensors = $query->get();

        if ($sensors->isEmpty()) {
            $this->warn('No active sensors found.');

            return self::FAILURE;
        }

        $storm = (bool) $this->option('storm');
        $alertsCreated = 0;

        foreach ($sensors as $sensor) {
            $zone = $sensor->floodZone;

            $waterLevel = $storm
                ? $this->faker_between($zone->warning_threshold, $zone->critical_threshold + 1.0)
                : $this->faker_between($zone->safe_threshold + 0.1, $zone->warning_threshold - 0.1);

            $reading = SensorReading::create([
                'sensor_id' => $sensor->id,
                'water_level' => round(max(0, $waterLevel), 2),
                'rainfall' => round($storm ? mt_rand(2000, 8000) / 100 : mt_rand(0, 1500) / 100, 2),
                'temperature' => round(26 + mt_rand(-30, 30) / 10, 2),
                'humidity' => min(100, max(40, 70 + mt_rand(-15, 25))),
                'recorded_at' => now(),
            ]);

            $sensor->update(['last_reading_at' => $reading->recorded_at]);

            $alert = $alertService->evaluateReading($sensor, $reading);

            if ($alert) {
                $alertsCreated++;
                $this->line(sprintf(
                    '  <fg=red>ALERT</> %s: %s (%sm)',
                    strtoupper($alert->severity),
                    $sensor->name,
                    $reading->water_level,
                ));
            } else {
                $this->line(sprintf('  <fg=green>OK</> %s: %sm', $sensor->name, $reading->water_level));
            }
        }

        $this->info(sprintf(
            'Simulated %d reading(s), created %d alert(s).',
            $sensors->count(),
            $alertsCreated,
        ));

        return self::SUCCESS;
    }

    private function faker_between(float $min, float $max): float
    {
        return $min + (mt_rand() / mt_getrandmax()) * ($max - $min);
    }
}
