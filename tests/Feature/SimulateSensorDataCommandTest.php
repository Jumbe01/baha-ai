<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\FloodZone;
use App\Models\Sensor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimulateSensorDataCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_generates_readings(): void
    {
        $zone = FloodZone::factory()->create();
        Sensor::factory()->for($zone)->count(2)->create(['status' => 'active']);

        $this->artisan('sensors:simulate')
            ->assertSuccessful();

        $this->assertDatabaseCount('sensor_readings', 2);
    }

    public function test_storm_flag_creates_alerts(): void
    {
        $zone = FloodZone::factory()->create([
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
        Sensor::factory()->for($zone)->create(['status' => 'active']);

        $this->artisan('sensors:simulate --storm')
            ->assertSuccessful();

        $this->assertGreaterThan(0, Alert::count());
    }

    public function test_storm_gives_a_believable_forecast(): void
    {
        $zone = FloodZone::factory()->create([
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
        $sensor = Sensor::factory()->for($zone)->create(['status' => 'active']);

        // Two quick clicks, like a live demo.
        $this->artisan('sensors:simulate --storm')->assertSuccessful();
        $this->artisan('sensors:simulate --storm')->assertSuccessful();

        $prediction = app(\App\Services\PredictionService::class)->generate($sensor);

        $this->assertNotNull($prediction);
        $this->assertGreaterThan(0, $prediction->rate_of_rise);
        $this->assertLessThan(0.05, $prediction->rate_of_rise); // under 3 m/h
        $this->assertLessThan(6.0, $prediction->predicted_level); // was ~96 m before
    }

    public function test_command_fails_without_active_sensors(): void
    {
        $this->artisan('sensors:simulate')
            ->assertFailed();
    }

    public function test_command_limits_to_specific_sensor(): void
    {
        $zone = FloodZone::factory()->create();
        $sensor = Sensor::factory()->for($zone)->create(['status' => 'active']);
        Sensor::factory()->for($zone)->create(['status' => 'active']);

        $this->artisan('sensors:simulate --sensor='.$sensor->id)
            ->assertSuccessful();

        $this->assertDatabaseCount('sensor_readings', 1);
    }
}
