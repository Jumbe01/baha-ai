<?php

namespace App\Console\Commands;

use App\Models\Sensor;
use App\Services\PredictionService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('predictions:generate')]
#[Description('Generate flood predictions for all active sensors via linear regression')]
class GeneratePredictions extends Command
{
    public function handle(PredictionService $service): int
    {
        $sensors = Sensor::with('floodZone')->where('status', 'active')->get();
        $generated = 0;
        $skipped = 0;

        foreach ($sensors as $sensor) {
            $prediction = $service->generate($sensor);

            if ($prediction) {
                $generated++;
                if ($prediction->minutes_to_critical !== null) {
                    $this->line(sprintf(
                        '  <fg=yellow>%s</>: critical in ~%d min (%.0f%% confidence)',
                        $sensor->name,
                        $prediction->minutes_to_critical,
                        $prediction->confidence,
                    ));
                }
            } else {
                $skipped++;
            }
        }

        $this->info(sprintf('Generated %d prediction(s), skipped %d (insufficient data).', $generated, $skipped));

        return self::SUCCESS;
    }
}
