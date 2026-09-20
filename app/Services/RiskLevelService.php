<?php

namespace App\Services;

use App\Models\FloodZone;
use App\Models\Sensor;

class RiskLevelService
{
    /**
     * @return array{level: string, color: string, label: string}
     */
    public function assess(Sensor $sensor): array
    {
        $reading = $sensor->latestReading;

        if (! $reading) {
            return ['level' => 'unknown', 'color' => 'gray', 'label' => 'No Data'];
        }

        return $this->forWaterLevel($reading->water_level, $sensor->floodZone);
    }

    /**
     * The risk of a zone is the risk of its worst-reporting sensor.
     *
     * Actuation must key off this rather than off whichever sensor happened to
     * report last, otherwise a safe reading from one sensor switches off a pump
     * that a critical reading from another just engaged.
     */
    public function highestForZone(FloodZone $zone): string
    {
        $rank = ['safe' => 0, 'unknown' => 0, 'warning' => 1, 'critical' => 2];
        $highest = 'safe';

        $sensors = $zone->sensors()
            ->with('latestReading')
            ->where('status', 'active')
            ->get();

        foreach ($sensors as $sensor) {
            if (! $sensor->latestReading) {
                continue;
            }

            $level = $this->forWaterLevel(
                (float) $sensor->latestReading->water_level,
                $zone,
            )['level'];

            if (($rank[$level] ?? 0) > ($rank[$highest] ?? 0)) {
                $highest = $level;
            }
        }

        return $highest;
    }

    /**
     * @return array{level: string, color: string, label: string}
     */
    public function forWaterLevel(float $waterLevel, FloodZone $zone): array
    {
        if ($waterLevel >= $zone->critical_threshold) {
            return ['level' => 'critical', 'color' => 'red', 'label' => 'Critical'];
        }

        if ($waterLevel >= $zone->warning_threshold) {
            return ['level' => 'warning', 'color' => 'yellow', 'label' => 'Warning'];
        }

        return ['level' => 'safe', 'color' => 'green', 'label' => 'Safe'];
    }
}
