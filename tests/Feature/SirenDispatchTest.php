<?php

namespace Tests\Feature;

use App\Models\ActuatorDevice;
use App\Models\Alert;
use App\Models\FloodZone;
use App\Models\NotificationLog;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use App\Services\AlertService;
use App\Services\NotificationDispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SirenDispatchTest extends TestCase
{
    use RefreshDatabase;

    private FloodZone $zone;

    private Sensor $sensor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->zone = FloodZone::factory()->create([
            'name' => 'Tayud River Basin',
            'barangay' => 'Tayud',
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);

        $this->sensor = Sensor::factory()->for($this->zone)->create();
    }

    private function ingest(float $level): ?Alert
    {
        $reading = SensorReading::create([
            'sensor_id' => $this->sensor->id,
            'water_level' => $level,
            'recorded_at' => now(),
        ]);

        $this->sensor->loadMissing('floodZone');

        return app(AlertService::class)->evaluateReading($this->sensor, $reading);
    }

    public function test_an_active_siren_is_recorded_as_a_dispatch_channel(): void
    {
        ActuatorDevice::factory()->for($this->zone)->auto()->create([
            'type' => 'siren',
            'name' => 'Tayud Warning Siren',
        ]);

        $alert = $this->ingest(3.4);

        $this->assertNotNull($alert);
        $this->assertDatabaseHas('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'siren',
            'recipient' => 'Tayud Warning Siren',
        ]);
    }

    public function test_siren_dispatch_is_recorded_without_a_user(): void
    {
        ActuatorDevice::factory()->for($this->zone)->auto()->create(['type' => 'siren']);

        $alert = $this->ingest(3.4);

        $log = NotificationLog::where('alert_id', $alert->id)
            ->where('channel', 'siren')
            ->firstOrFail();

        $this->assertNull($log->user_id, 'A siren warns a zone, not one person.');
    }

    public function test_a_siren_that_never_sounded_is_not_logged(): void
    {
        // Manual mode, so the automation leaves it alone and it stays off.
        ActuatorDevice::factory()->for($this->zone)->manual()->create(['type' => 'siren']);

        $alert = $this->ingest(3.4);

        $this->assertDatabaseMissing('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'siren',
        ]);
    }

    public function test_siren_delivery_is_not_claimed_as_sent(): void
    {
        ActuatorDevice::factory()->for($this->zone)->auto()->create(['type' => 'siren']);

        $alert = $this->ingest(3.4);

        $this->assertDatabaseHas('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'siren',
            'status' => 'simulated',
        ]);
    }

    public function test_pumps_are_not_logged_as_a_notification_channel(): void
    {
        ActuatorDevice::factory()->for($this->zone)->auto()->create(['type' => 'pump']);

        $alert = $this->ingest(3.4);

        $this->assertDatabaseMissing('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'pump',
        ]);
    }

    public function test_dispatch_reports_how_many_sirens_sounded(): void
    {
        ActuatorDevice::factory()->for($this->zone)->auto()->count(2)->create([
            'type' => 'siren',
            'is_on' => true,
        ]);

        $alert = Alert::factory()->for($this->zone)->create([
            'severity' => 'critical',
            'water_level' => 3.5,
        ]);

        $result = app(NotificationDispatcher::class)->dispatch($alert);

        $this->assertSame(2, $result['sirens']);
    }

    public function test_alert_page_shows_the_siren_channel(): void
    {
        $staff = User::factory()->staff()->create();
        ActuatorDevice::factory()->for($this->zone)->auto()->create(['type' => 'siren']);

        $alert = $this->ingest(3.4);

        $this->actingAs($staff)
            ->get(route('alerts.show', $alert))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Alerts/Show')
                ->has('alert.notification_logs')
            );
    }
}
