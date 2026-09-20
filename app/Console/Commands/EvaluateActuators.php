<?php

namespace App\Console\Commands;

use App\Models\FloodZone;
use App\Services\ActuatorSimulationService;
use App\Services\RiskLevelService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('actuators:evaluate')]
#[Description('Drive auto-mode pumps, valves and sirens from each zone current risk level')]
class EvaluateActuators extends Command
{
    public function handle(ActuatorSimulationService $actuators, RiskLevelService $riskService): int
    {
        $zones = FloodZone::with(['sensors.latestReading', 'actuatorDevices'])
            ->where('is_active', true)
            ->get();

        $changed = 0;

        foreach ($zones as $zone) {
            $level = $riskService->highestForZone($zone);
            $affected = $actuators->evaluateZone($zone, $level);

            if ($affected > 0) {
                $this->line(sprintf(
                    '  <fg=yellow>%s</> — risk %s, %d device(s) changed',
                    $zone->name,
                    $level,
                    $affected,
                ));
            }

            $changed += $affected;
        }

        $this->info(sprintf(
            'Evaluated %d zone(s) — %d device state change(s).',
            $zones->count(),
            $changed,
        ));

        return self::SUCCESS;
    }

}
