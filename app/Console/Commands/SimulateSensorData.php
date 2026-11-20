<?php

namespace App\Console\Commands;

use App\Models\Alert;
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
    /** A sensor whose device posted this recently is live hardware; its next post would overwrite ours. */
    private const LIVE_WINDOW_SECONDS = 60;

    public function handle(AlertService $alertService): int
    {
        // Offline sensors are included: a simulated device reporting again is
        // exactly what brings a real one back online, and excluding them would
        // silently kill the simulator 30 minutes after seeding.
        $query = Sensor::with('floodZone')->whereIn('status', ['active', 'offline']);

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
        $resolved = 0;
        $skipped = 0;
        $simulated = 0;

        // Reset closes the alerts earlier storms raised; otherwise their
        // dedup check silences every storm after the first.
        if (! $storm) {
            Alert::active()->where('source', 'simulation')
                ->when($sensorId, fn ($q) => $q->where('sensor_id', $sensorId))
                ->get()
                ->each(function (Alert $alert) use ($alertService, &$resolved) {
                    $alertService->resolve($alert);
                    $resolved++;
                });
        }

        foreach ($sensors as $sensor) {
            if ($this->isLiveHardware($sensor)) {
                $skipped++;
                $this->line(sprintf('  <fg=yellow>SKIP</> %s: live hardware is reporting', $sensor->name));

                continue;
            }

            $zone = $sensor->floodZone;

            // Calm stays strictly inside the safe band, however narrow the zone's thresholds are.
            $waterLevel = $storm
                ? $this->faker_between($zone->warning_threshold, $zone->critical_threshold + 1.0)
                : $zone->safe_threshold + ($zone->warning_threshold - $zone->safe_threshold) * $this->faker_between(0.1, 0.8);

            $reading = SensorReading::create([
                'sensor_id' => $sensor->id,
                'water_level' => round(max(0, $waterLevel), 2),
                'rainfall' => round($storm ? mt_rand(2000, 8000) / 100 : mt_rand(0, 1500) / 100, 2),
                'temperature' => round(26 + mt_rand(-30, 30) / 10, 2),
                'humidity' => min(100, max(40, 70 + mt_rand(-15, 25))),
                'is_simulated' => true,
                'recorded_at' => now(),
            ]);
            $simulated++;

            // Quietly: a demo click must not write an audit-log row per sensor.
            $sensor->updateQuietly([
                'last_reading_at' => $reading->recorded_at,
                'status' => 'active',
            ]);

            $alert = $alertService->evaluateReading($sensor, $reading, 'simulation');

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

        $summary = sprintf('Simulated %d reading(s), created %d alert(s)', $simulated, $alertsCreated);
        if ($resolved) {
            $summary .= sprintf(', resolved %d simulated alert(s)', $resolved);
        }
        if ($skipped) {
            $summary .= sprintf(', skipped %d live hardware sensor(s)', $skipped);
        }
        $this->info($summary.'.');

        return self::SUCCESS;
    }

    private function isLiveHardware(Sensor $sensor): bool
    {
        // Only a real device post counts: the simulator's own readings also
        // bump last_reading_at, which would wrongly mark the sensor live.
        return SensorReading::where('sensor_id', $sensor->id)
            ->where('is_simulated', false)
            ->where('created_at', '>=', now()->subSeconds(self::LIVE_WINDOW_SECONDS))
            ->exists();
    }

    private function faker_between(float $min, float $max): float
    {
        return $min + (mt_rand() / mt_getrandmax()) * ($max - $min);
    }
}
