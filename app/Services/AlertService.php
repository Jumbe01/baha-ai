<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\Sensor;
use App\Models\SensorReading;

class AlertService
{
    public function __construct(
        private RiskLevelService $riskService,
        private NotificationDispatcher $dispatcher,
    ) {}

    /**
     * Evaluate a sensor reading against its zone thresholds. If the reading
     * breaches the warning or critical threshold and there is no matching
     * active alert, create a new alert and dispatch notifications.
     */
    public function evaluateReading(Sensor $sensor, SensorReading $reading): ?Alert
    {
        $zone = $sensor->floodZone;
        $assessment = $this->riskService->forWaterLevel($reading->water_level, $zone);

        if ($assessment['level'] === 'safe') {
            return null;
        }

        $existing = Alert::active()
            ->where('flood_zone_id', $zone->id)
            ->where('sensor_id', $sensor->id)
            ->where('severity', $assessment['level'])
            ->first();

        if ($existing) {
            return null;
        }

        $alert = Alert::create([
            'flood_zone_id' => $zone->id,
            'sensor_id' => $sensor->id,
            'severity' => $assessment['level'],
            'title' => sprintf('%s water level at %s', ucfirst($assessment['level']), $zone->name),
            'message' => sprintf(
                'Sensor %s recorded a water level of %sm, breaching the %s threshold of %sm in %s, %s.',
                $sensor->name,
                $reading->water_level,
                $assessment['level'],
                $assessment['level'] === 'critical' ? $zone->critical_threshold : $zone->warning_threshold,
                $zone->name,
                $zone->barangay,
            ),
            'water_level' => $reading->water_level,
            'status' => 'active',
            'source' => 'automatic',
        ]);

        $this->dispatcher->dispatch($alert);

        return $alert;
    }

    /**
     * Raise an alert for any active sensor that has stopped reporting for
     * longer than the given threshold. Deduplicated against existing active
     * offline alerts so it does not spam on every run.
     *
     * @return int Number of new offline alerts created
     */
    public function flagOfflineSensors(int $minutes = 30): int
    {
        $cutoff = now()->subMinutes($minutes);
        $created = 0;

        $sensors = Sensor::with('floodZone')
            ->where('status', 'active')
            ->where(function ($query) use ($cutoff) {
                $query->whereNull('last_reading_at')->orWhere('last_reading_at', '<', $cutoff);
            })
            ->get();

        foreach ($sensors as $sensor) {
            if (! $sensor->floodZone) {
                continue;
            }

            $alreadyFlagged = Alert::active()
                ->where('sensor_id', $sensor->id)
                ->where('title', 'like', 'Sensor offline%')
                ->exists();

            if ($alreadyFlagged) {
                continue;
            }

            $lastSeen = $sensor->last_reading_at
                ? $sensor->last_reading_at->diffForHumans()
                : 'never';

            $alert = Alert::create([
                'flood_zone_id' => $sensor->floodZone->id,
                'sensor_id' => $sensor->id,
                'severity' => 'warning',
                'title' => sprintf('Sensor offline: %s', $sensor->name),
                'message' => sprintf(
                    'Sensor %s in %s, %s has stopped reporting (last reading: %s). Monitoring for this area may be degraded — please check the device.',
                    $sensor->name,
                    $sensor->floodZone->name,
                    $sensor->floodZone->barangay,
                    $lastSeen,
                ),
                'water_level' => null,
                'status' => 'active',
                'source' => 'automatic',
            ]);

            $this->dispatcher->dispatch($alert);
            $created++;
        }

        return $created;
    }

    public function resolve(Alert $alert, ?int $userId = null): Alert
    {
        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => $userId,
        ]);

        return $alert;
    }
}
