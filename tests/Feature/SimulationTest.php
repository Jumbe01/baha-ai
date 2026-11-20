<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\FloodIncident;
use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimulationTest extends TestCase
{
    use RefreshDatabase;

    private function zoneWithSensor(array $sensor = []): Sensor
    {
        $zone = FloodZone::factory()->create([
            'barangay' => 'Tayud',
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);

        return Sensor::factory()->for($zone)->create(['status' => 'active', ...$sensor]);
    }

    public function test_staff_can_trigger_a_storm_simulation(): void
    {
        $staff = User::factory()->staff()->create();
        $this->zoneWithSensor();

        $response = $this->actingAs($staff)->post(route('simulation.storm'));

        $response->assertRedirect();
        $response->assertSessionHas('success', fn ($msg) => str_contains($msg, 'Simulated 1 reading(s), created 1 alert(s)'));
        $this->assertDatabaseCount('sensor_readings', 1);
        $this->assertDatabaseHas('alerts', ['source' => 'simulation', 'status' => 'active']);
    }

    public function test_residents_cannot_trigger_simulation(): void
    {
        $resident = User::factory()->resident()->create();

        $this->actingAs($resident)->post(route('simulation.storm'))->assertForbidden();
    }

    public function test_a_second_storm_after_reset_alerts_again(): void
    {
        $staff = User::factory()->staff()->create();
        $this->zoneWithSensor();

        $this->actingAs($staff)->post(route('simulation.storm'));
        $this->actingAs($staff)->post(route('simulation.calm'));
        $this->actingAs($staff)->post(route('simulation.storm'));

        $this->assertSame(2, Alert::where('source', 'simulation')->count());
        $this->assertSame(1, Alert::active()->count());
    }

    public function test_reset_resolves_simulated_alerts_without_recording_incidents(): void
    {
        $staff = User::factory()->staff()->create();
        $this->zoneWithSensor();

        $this->actingAs($staff)->post(route('simulation.storm'));
        $this->actingAs($staff)->post(route('simulation.calm'))
            ->assertSessionHas('success', fn ($msg) => str_contains($msg, 'resolved 1 simulated alert(s)'));

        $this->assertSame(0, Alert::active()->count());
        $this->assertSame(0, FloodIncident::count());
    }

    public function test_storm_without_sensors_flashes_an_error(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->post(route('simulation.storm'))
            ->assertSessionHas('error', 'No active sensors found.')
            ->assertSessionMissing('success');
    }

    public function test_live_hardware_sensor_is_skipped(): void
    {
        $staff = User::factory()->staff()->create();
        $sensor = $this->zoneWithSensor(['api_token' => hash('sha256', 'device')]);
        SensorReading::factory()->for($sensor)->create(['water_level' => 0.5, 'recorded_at' => now()]);

        $this->actingAs($staff)->post(route('simulation.storm'))
            ->assertSessionHas('success', fn ($msg) => str_contains($msg, 'skipped 1 live hardware sensor(s)'));

        $this->assertSame(0, SensorReading::where('is_simulated', true)->count());
    }

    public function test_a_token_sensor_without_a_device_post_is_still_reset(): void
    {
        $staff = User::factory()->staff()->create();
        $this->zoneWithSensor(['api_token' => hash('sha256', 'device')]);

        $this->actingAs($staff)->post(route('simulation.storm'));
        $this->actingAs($staff)->post(route('simulation.calm'));

        $this->assertSame(2, SensorReading::where('is_simulated', true)->count());
    }

    public function test_calm_reading_stays_safe_in_a_narrow_zone(): void
    {
        $zone = FloodZone::factory()->create(['safe_threshold' => 1.0, 'warning_threshold' => 1.05, 'critical_threshold' => 2.0]);
        Sensor::factory()->for($zone)->count(5)->create(['status' => 'active']);

        $this->artisan('sensors:simulate')->assertSuccessful();

        $this->assertSame(0, SensorReading::where('water_level', '>=', 1.05)->count());
        $this->assertSame(0, Alert::count());
    }
}
