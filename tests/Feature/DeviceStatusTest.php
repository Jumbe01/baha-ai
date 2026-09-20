<?php

namespace Tests\Feature;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\User;
use App\Services\AlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceStatusTest extends TestCase
{
    use RefreshDatabase;

    private Sensor $sensor;

    private string $token = 'device-status-token';

    protected function setUp(): void
    {
        parent::setUp();

        $zone = FloodZone::factory()->create(['warning_threshold' => 1.5, 'critical_threshold' => 3.0]);
        $this->sensor = Sensor::factory()->for($zone)->create([
            'api_token' => hash('sha256', $this->token),
            'battery_level' => null,
            'status' => 'active',
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function headers(): array
    {
        return ['Authorization' => 'Bearer '.$this->token];
    }

    public function test_a_device_can_report_its_battery_level(): void
    {
        $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.2,
            'battery_level' => 87.5,
        ], $this->headers())->assertCreated();

        $this->assertEquals(87.5, (float) $this->sensor->fresh()->battery_level);
    }

    public function test_battery_level_is_not_stored_on_the_reading(): void
    {
        $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.2,
            'battery_level' => 55,
        ], $this->headers())->assertCreated();

        $this->assertDatabaseCount('sensor_readings', 1);
        $this->assertDatabaseHas('sensor_readings', ['water_level' => 1.2]);
    }

    public function test_battery_level_is_validated(): void
    {
        $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.2,
            'battery_level' => 150,
        ], $this->headers())->assertUnprocessable()
            ->assertJsonValidationErrors('battery_level');
    }

    public function test_readings_without_battery_leave_the_existing_value_alone(): void
    {
        $this->sensor->update(['battery_level' => 64]);

        $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.2,
        ], $this->headers())->assertCreated();

        $this->assertEquals(64, (float) $this->sensor->fresh()->battery_level);
    }

    public function test_a_silent_sensor_is_marked_offline(): void
    {
        $this->sensor->update(['last_reading_at' => now()->subHours(2)]);

        app(AlertService::class)->flagOfflineSensors(30);

        $this->assertSame('offline', $this->sensor->fresh()->status);
    }

    public function test_reporting_again_brings_a_sensor_back_online(): void
    {
        $this->sensor->update(['status' => 'offline', 'last_reading_at' => now()->subHours(2)]);

        $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 0.8,
        ], $this->headers())->assertCreated();

        $this->assertSame('active', $this->sensor->fresh()->status);
    }

    public function test_a_sensor_under_maintenance_is_not_flipped_to_active(): void
    {
        $this->sensor->update(['status' => 'maintenance']);

        $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 0.8,
        ], $this->headers())->assertCreated();

        $this->assertSame('maintenance', $this->sensor->fresh()->status);
    }

    public function test_the_simulator_revives_offline_sensors(): void
    {
        $this->sensor->update(['status' => 'offline', 'last_reading_at' => now()->subHours(2)]);

        $this->artisan('sensors:simulate')->assertSuccessful();

        $this->assertSame('active', $this->sensor->fresh()->status);
    }

    public function test_battery_level_is_visible_to_an_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $this->sensor->update(['battery_level' => 42.5]);

        $this->actingAs($admin)
            ->get(route('admin.sensors.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('sensors.0.battery_level', '42.50')
            );
    }
}
