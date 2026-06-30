<?php

namespace Database\Seeders;

use App\Models\ActuatorDevice;
use App\Models\ActuatorLog;
use App\Models\FloodZone;
use Illuminate\Database\Seeder;

class ActuatorSeeder extends Seeder
{
    public function run(): void
    {
        $zones = FloodZone::all();

        if ($zones->isEmpty()) {
            return;
        }

        $devices = [
            ['name' => 'Tayud Drainage Pump A', 'type' => 'pump'],
            ['name' => 'Tayud Warning Siren', 'type' => 'siren'],
            ['name' => 'Casili Floodgate', 'type' => 'floodgate'],
            ['name' => 'Jugan Drainage Pump B', 'type' => 'pump'],
            ['name' => 'Pitogo Warning Siren', 'type' => 'siren'],
            ['name' => 'Nangka Control Valve', 'type' => 'valve'],
            ['name' => 'Garing Drainage Pump C', 'type' => 'pump'],
        ];

        foreach ($devices as $index => $config) {
            $zone = $zones[$index % $zones->count()];

            $device = ActuatorDevice::create([
                'flood_zone_id' => $zone->id,
                'name' => $config['name'],
                'type' => $config['type'],
                'latitude' => $zone->coordinates[0]['lat'] + (rand(-30, 30) / 10000),
                'longitude' => $zone->coordinates[0]['lng'] + (rand(-30, 30) / 10000),
                'is_on' => false,
                'mode' => rand(0, 1) ? 'auto' : 'manual',
                'status' => 'operational',
            ]);

            // Seed a few historical log entries
            for ($i = 0; $i < rand(2, 5); $i++) {
                ActuatorLog::create([
                    'actuator_device_id' => $device->id,
                    'user_id' => null,
                    'action' => rand(0, 1) ? 'turned_on' : 'turned_off',
                    'trigger' => rand(0, 1) ? 'automatic' : 'manual',
                    'notes' => 'Historical activation record',
                    'logged_at' => now()->subDays(rand(1, 60))->subHours(rand(0, 23)),
                ]);
            }
        }
    }
}
