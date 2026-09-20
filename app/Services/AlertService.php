<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\FloodIncident;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;

class AlertService
{
    public function __construct(
        private RiskLevelService $riskService,
        private NotificationDispatcher $dispatcher,
        private ActuatorSimulationService $actuators,
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

        // Drive auto-mode hardware on every reading, including safe ones —
        // that is what releases pumps and sirens once the water recedes.
        // Keyed off the whole zone, not this one sensor, so a safe reading
        // cannot switch off hardware another sensor still needs engaged.
        $this->actuators->evaluateZone($zone, $this->riskService->highestForZone($zone));

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

            // Reflect reachability on the device itself, so the sensor list
            // shows live state rather than only its configured status.
            $sensor->update(['status' => 'offline']);

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

        $this->recordIncident($alert);

        return $alert;
    }

    /**
     * Turn a resolved threshold alert into a historical flood incident,
     * deriving its figures from the readings actually recorded while the
     * alert was active. This is what makes analytics and the CSV/PDF exports
     * reflect real events rather than seeded sample data.
     */
    public function recordIncident(Alert $alert): ?FloodIncident
    {
        // Offline-sensor alerts carry no water level and are not flood events.
        if (! $alert->sensor_id || $alert->water_level === null) {
            return null;
        }

        if (FloodIncident::where('alert_id', $alert->id)->exists()) {
            return null;
        }

        $from = $alert->created_at;
        $to = $alert->resolved_at ?? now();

        $readings = SensorReading::where('sensor_id', $alert->sensor_id)
            ->whereBetween('recorded_at', [$from, $to])
            ->get(['water_level', 'rainfall']);

        $peak = $readings->max('water_level') ?? $alert->water_level;
        $rainfall = $readings->sum('rainfall');

        $zone = $alert->floodZone;

        $affected = $zone
            ? User::where('barangay', $zone->barangay)->where('role', 'resident')->count()
            : 0;

        return FloodIncident::create([
            'flood_zone_id' => $alert->flood_zone_id,
            'alert_id' => $alert->id,
            'severity' => $alert->severity,
            'peak_water_level' => round((float) $peak, 2),
            'total_rainfall' => round((float) $rainfall, 2),
            'duration_minutes' => (int) round($from->diffInMinutes($to)),
            'affected_residents' => $affected,
            'description' => sprintf(
                'Recorded from alert #%d — %s water level peaked at %.2fm in %s.',
                $alert->id,
                $alert->severity,
                $peak,
                $zone?->name ?? 'unknown zone',
            ),
            'occurred_at' => $from,
        ]);
    }
}
