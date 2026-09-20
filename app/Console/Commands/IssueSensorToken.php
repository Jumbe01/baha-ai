<?php

namespace App\Console\Commands;

use App\Models\Sensor;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

#[Signature('sensors:token {sensor : The sensor ID}')]
#[Description('Issue a new API token for a physical sensor node')]
class IssueSensorToken extends Command
{
    public function handle(): int
    {
        $sensor = Sensor::find($this->argument('sensor'));

        if (! $sensor) {
            $this->error('Sensor not found.');

            return self::FAILURE;
        }

        $plain = Str::random(48);
        $sensor->update(['api_token' => hash('sha256', $plain)]);

        $this->info(sprintf('Token for sensor #%d (%s):', $sensor->id, $sensor->name));
        $this->line($plain);
        $this->warn('Copy it now — it is stored hashed and cannot be shown again.');

        return self::SUCCESS;
    }
}
