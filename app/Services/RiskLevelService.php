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
