<?php

namespace Database\Seeders;

use App\Models\FloodIncident;
use App\Models\FloodZone;
use Illuminate\Database\Seeder;

class FloodIncidentSeeder extends Seeder
{
    public function run(): void
    {
        $zones = FloodZone::all();

        if ($zones->isEmpty()) {
            return;
        }

        FloodIncident::factory()
            ->count(25)
            ->sequence(fn () => ['flood_zone_id' => $zones->random()->id])
            ->create();
    }
}
