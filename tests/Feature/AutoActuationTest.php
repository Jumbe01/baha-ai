<?php

namespace Tests\Feature;

use App\Models\ActuatorDevice;
use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use App\Services\ActuatorSimulationService;
use App\Services\AlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutoActuationTest extends TestCase
{
    use RefreshDatabase;

    private FloodZone $zone;

    private Sensor $sensor;

    private AlertService $alerts;

    private ActuatorSimulationService $actuators;

    protected function setUp(): void
    {
        parent::setUp();

        $this->alerts = app(AlertService::class);
        $this->actuators = app(ActuatorSimulationService::class);

        $this->zone = FloodZone::factory()->create([
            'barangay' => 'Tayud',
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);

        $this->sensor = Sensor::factory()->for($this->zone)->create();
    }

    private function device(string $type, string $mode = 'auto', bool $on = false): ActuatorDevice
    {
        return ActuatorDevice::factory()->for($this->zone)->create([
            'type' => $type,
            'mode' => $mode,
            'is_on' => $on,
            'status' => 'operational',
        ]);
    }

    private function ingest(float $waterLevel): void
    {
        $reading = SensorReading::create([
            'sensor_id' => $this->sensor->id,
            'water_level' => $waterLevel,
            'recorded_at' => now(),
        ]);

        $this->sensor->loadMissing('floodZone');
        $this->alerts->evaluateReading($this->sensor, $reading);
    }

    public function test_auto_pump_engages_when_zone_reaches_critical(): void
    {
        $pump = $this->device('pump');

        $this->ingest(3.5);

        $this->assertTrue($pump->fresh()->is_on);
        $this->assertDatabaseHas('actuator_logs', [
            'actuator_device_id' => $pump->id,
            'action' => 'turned_on',
            'trigger' => 'automatic',
        ]);
    }

    public function test_auto_pump_releases_when_water_recedes_to_safe(): void
    {
        $pump = $this->device('pump', 'auto', on: true);

        $this->ingest(0.4);

        $this->assertFalse($pump->fresh()->is_on);
        $this->assertDatabaseHas('actuator_logs', [
            'actuator_device_id' => $pump->id,
            'action' => 'turned_off',
            'trigger' => 'automatic',
        ]);
    }

    public function test_pump_does_not_engage_at_warning_level(): void
    {
        $pump = $this->device('pump');

        $this->ingest(2.0);

        $this->assertFalse($pump->fresh()->is_on);
    }

    public function test_siren_engages_at_warning_level(): void
    {
        $siren = $this->device('siren');

        $this->ingest(2.0);

        $this->assertTrue($siren->fresh()->is_on, 'Sirens should sound from warning level.');
    }

    public function test_manual_devices_are_never_touched_by_automation(): void
    {
        $manual = $this->device('pump', 'manual');

        $this->ingest(3.5);

        $this->assertFalse($manual->fresh()->is_on);
        $this->assertDatabaseMissing('actuator_logs', [
            'actuator_device_id' => $manual->id,
            'trigger' => 'automatic',
        ]);
    }

    public function test_devices_under_maintenance_are_skipped(): void
    {
        $offline = ActuatorDevice::factory()->for($this->zone)->create([
            'type' => 'pump',
            'mode' => 'auto',
            'is_on' => false,
            'status' => 'maintenance',
        ]);

        $this->ingest(3.5);

        $this->assertFalse($offline->fresh()->is_on);
    }

    public function test_repeated_evaluation_does_not_duplicate_log_entries(): void
    {
        $pump = $this->device('pump');

        $this->actuators->evaluateZone($this->zone, 'critical');
        $this->actuators->evaluateZone($this->zone, 'critical');
        $this->actuators->evaluateZone($this->zone, 'critical');

        $this->assertDatabaseCount('actuator_logs', 1);
        $this->assertTrue($pump->fresh()->is_on);
    }

    public function test_evaluate_zone_reports_how_many_devices_changed(): void
    {
        $this->device('pump');
        $this->device('valve');
        $this->device('pump', 'manual');

        $changed = $this->actuators->evaluateZone($this->zone, 'critical');

        $this->assertSame(2, $changed);
    }

    public function test_scheduled_command_drives_devices_from_latest_readings(): void
    {
        $pump = $this->device('pump');

        SensorReading::create([
            'sensor_id' => $this->sensor->id,
            'water_level' => 4.0,
            'recorded_at' => now(),
        ]);

        $this->artisan('actuators:evaluate')->assertSuccessful();

        $this->assertTrue($pump->fresh()->is_on);
    }

    public function test_a_safe_sensor_does_not_switch_off_hardware_another_sensor_needs(): void
    {
        $pump = $this->device('pump');
        $second = Sensor::factory()->for($this->zone)->create();

        // One sensor is critical...
        $this->ingest(3.8);
        $this->assertTrue($pump->fresh()->is_on, 'Critical reading should engage the pump.');

        // ...then a different sensor in the same zone reports safe.
        $safeReading = SensorReading::create([
            'sensor_id' => $second->id,
            'water_level' => 0.2,
            'recorded_at' => now(),
        ]);
        $second->loadMissing('floodZone');
        $this->alerts->evaluateReading($second, $safeReading);

        $this->assertTrue(
            $pump->fresh()->is_on,
            'The pump must stay on while any sensor in the zone is still critical.',
        );
    }

    public function test_hardware_releases_only_when_every_sensor_is_safe(): void
    {
        $pump = $this->device('pump', 'auto', on: true);
        $second = Sensor::factory()->for($this->zone)->create();

        SensorReading::create([
            'sensor_id' => $second->id,
            'water_level' => 0.1,
            'recorded_at' => now(),
        ]);

        $this->ingest(0.3);

        $this->assertFalse($pump->fresh()->is_on);
    }

    public function test_manual_toggle_is_refused_on_an_auto_mode_device(): void
    {
        $pump = $this->device('pump');
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)
            ->patch(route('actuation.toggle', $pump))
            ->assertSessionHas('error');

        $this->assertFalse($pump->fresh()->is_on);
    }

    public function test_manual_toggle_still_works_in_manual_mode(): void
    {
        $pump = $this->device('pump', 'manual');
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)
            ->patch(route('actuation.toggle', $pump))
            ->assertSessionHas('success');

        $this->assertTrue($pump->fresh()->is_on);
    }
}
