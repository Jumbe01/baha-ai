<?php

namespace Database\Seeders;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SensorSeeder extends Seeder
{
    public function run(): void
    {
        $floodZones = FloodZone::all();

        $sensorTypes = ['ultrasonic', 'rain_gauge', 'pressure'];
        $sensorIndex = 1;

        foreach ($floodZones as $zone) {
            $sensorCount = rand(1, 3);

            for ($i = 0; $i < $sensorCount; $i++) {
                $sensor = Sensor::create([
                    'flood_zone_id' => $zone->id,
                    'name' => 'Sensor-'.str_pad($sensorIndex++, 3, '0', STR_PAD_LEFT),
                    'type' => $sensorTypes[array_rand($sensorTypes)],
                    'latitude' => $zone->coordinates[0]['lat'] + (rand(-50, 50) / 10000),
                    'longitude' => $zone->coordinates[0]['lng'] + (rand(-50, 50) / 10000),
                    'status' => 'active',
                    'battery_level' => rand(60, 100),
                ]);

                $this->generateReadings($sensor, $zone);
            }
        }
    }

    private function generateReadings(Sensor $sensor, FloodZone $zone): void
    {
        $now = Carbon::now();
        $startDate = $now->copy()->subDays(30);
        $readings = [];

        $baseLevel = $zone->safe_threshold + 0.3;
        $current = $startDate->copy();

        while ($current->lte($now)) {
            $dayOfYear = $current->dayOfYear;
            $hourOfDay = $current->hour;

            $tidal = 0.3 * sin(2 * M_PI * $hourOfDay / 24);
            $seasonal = 0.5 * sin(2 * M_PI * ($dayOfYear - 150) / 365);
            $noise = (rand(-100, 100) / 1000);

            $isStorm = rand(1, 100) <= 3;
            $stormSurge = $isStorm ? rand(100, 250) / 100 : 0;

            $waterLevel = max(0, $baseLevel + $tidal + $seasonal + $noise + $stormSurge);
            $rainfall = max(0, $isStorm ? rand(20, 80) : rand(0, 15)) + (rand(0, 100) / 100);
            $temperature = 26 + 4 * sin(2 * M_PI * ($hourOfDay - 14) / 24) + (rand(-10, 10) / 10);
            $humidity = 70 + 15 * sin(2 * M_PI * ($hourOfDay - 6) / 24) + rand(-5, 5);

            $readings[] = [
                'sensor_id' => $sensor->id,
                'water_level' => round($waterLevel, 2),
                'rainfall' => round($rainfall, 2),
                'temperature' => round($temperature, 2),
                'humidity' => min(100, max(30, round($humidity, 2))),
                'recorded_at' => $current->copy(),
                'created_at' => $current->copy(),
                'updated_at' => $current->copy(),
            ];

            if (count($readings) >= 500) {
                SensorReading::insert($readings);
                $readings = [];
            }

            $current->addMinutes(15);
        }

        if (count($readings) > 0) {
            SensorReading::insert($readings);
        }

        $latestReading = SensorReading::where('sensor_id', $sensor->id)
            ->orderBy('recorded_at', 'desc')
            ->first();

        if ($latestReading) {
            $sensor->update(['last_reading_at' => $latestReading->recorded_at]);
        }
    }
}
