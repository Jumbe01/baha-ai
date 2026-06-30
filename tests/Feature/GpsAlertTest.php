<?php

namespace Tests\Feature;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GpsAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_gps_alerts_page_loads(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->actingAs($user)->get(route('gps-alerts.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('GpsAlerts/Index')
            ->has('floodedZones')
            ->has('evacuationCenter')
        );
    }

    public function test_only_flooded_zones_are_returned(): void
    {
        $user = User::factory()->staff()->create();

        $floodedZone = FloodZone::factory()->create([
            'is_active' => true,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
        $floodedSensor = Sensor::factory()->for($floodedZone)->create();
        SensorReading::factory()->for($floodedSensor)->create([
            'water_level' => 3.5,
            'recorded_at' => now(),
        ]);

        $safeZone = FloodZone::factory()->create([
            'is_active' => true,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
        $safeSensor = Sensor::factory()->for($safeZone)->create();
        SensorReading::factory()->for($safeSensor)->create([
            'water_level' => 0.5,
            'recorded_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('gps-alerts.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('floodedZones', 1)
            ->where('floodedZones.0.risk', 'critical')
        );
    }

    public function test_flooded_zone_includes_evacuation_route(): void
    {
        $user = User::factory()->resident()->create();

        $zone = FloodZone::factory()->create([
            'is_active' => true,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
        $sensor = Sensor::factory()->for($zone)->create();
        SensorReading::factory()->for($sensor)->create([
            'water_level' => 2.0,
            'recorded_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('gps-alerts.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('floodedZones.0.evacuation_route')
            ->has('floodedZones.0.center')
        );
    }
}
