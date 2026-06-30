<?php

namespace Tests\Feature;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_loads_for_authenticated_user(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats')
            ->has('floodZones')
            ->has('recentReadings')
        );
    }

    public function test_dashboard_returns_correct_sensor_counts(): void
    {
        $user = User::factory()->staff()->create();
        $zone = FloodZone::factory()->create();

        Sensor::factory()->for($zone)->count(3)->create(['status' => 'active']);
        Sensor::factory()->for($zone)->count(2)->create(['status' => 'inactive']);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.activeSensors', 3)
            ->where('stats.totalSensors', 5)
        );
    }

    public function test_dashboard_returns_risk_counts(): void
    {
        $user = User::factory()->admin()->create();
        $zone = FloodZone::factory()->create([
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);

        $safeSensor = Sensor::factory()->for($zone)->create(['status' => 'active']);
        SensorReading::factory()->for($safeSensor)->create(['water_level' => 0.5, 'recorded_at' => now()]);

        $warnSensor = Sensor::factory()->for($zone)->create(['status' => 'active']);
        SensorReading::factory()->for($warnSensor)->create(['water_level' => 2.0, 'recorded_at' => now()]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.riskCounts.safe', 1)
            ->where('stats.riskCounts.warning', 1)
        );
    }

    public function test_dashboard_returns_flood_zone_status(): void
    {
        $user = User::factory()->resident()->create();
        $zone = FloodZone::factory()->create(['is_active' => true]);
        $sensor = Sensor::factory()->for($zone)->create(['status' => 'active']);
        SensorReading::factory()->for($sensor)->create(['water_level' => 1.0, 'recorded_at' => now()]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('floodZones', 1)
        );
    }

    public function test_dashboard_requires_authentication(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }
}
