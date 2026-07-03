<?php

namespace App\Console\Commands;

use App\Services\AlertService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('sensors:check-offline {--minutes=30 : Minutes without a reading before a sensor is considered offline}')]
#[Description('Raise alerts for active sensors that have stopped reporting')]
class CheckOfflineSensors extends Command
{
    public function handle(AlertService $alertService): int
    {
        $minutes = (int) $this->option('minutes');
        $created = $alertService->flagOfflineSensors($minutes);

        $this->info(sprintf('Checked for offline sensors (>%d min) — %d new alert(s) created.', $minutes, $created));

        return self::SUCCESS;
    }
}
