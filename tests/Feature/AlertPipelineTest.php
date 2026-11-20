<?php

namespace Tests\Feature;

use App\Mail\AlertNotificationMail;
use App\Models\Alert;
use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use App\Services\AlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AlertPipelineTest extends TestCase
{
    use RefreshDatabase;

    private AlertService $service;

    private FloodZone $zone;

    private Sensor $sensor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AlertService::class);
        $this->zone = FloodZone::factory()->create([
            'barangay' => 'Tayud',
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
        $this->sensor = Sensor::factory()->for($this->zone)->create();
    }

    private function reading(float $waterLevel): SensorReading
    {
        return SensorReading::factory()->for($this->sensor)->create([
            'water_level' => $waterLevel,
            'recorded_at' => now(),
        ]);
    }

    public function test_safe_reading_creates_no_alert(): void
    {
        $alert = $this->service->evaluateReading($this->sensor, $this->reading(0.5));

        $this->assertNull($alert);
        $this->assertDatabaseCount('alerts', 0);
    }

    public function test_warning_reading_creates_warning_alert(): void
    {
        $alert = $this->service->evaluateReading($this->sensor, $this->reading(2.0));

        $this->assertNotNull($alert);
        $this->assertEquals('warning', $alert->severity);
        $this->assertDatabaseHas('alerts', ['severity' => 'warning', 'status' => 'active']);
    }

    public function test_critical_reading_creates_critical_alert(): void
    {
        $alert = $this->service->evaluateReading($this->sensor, $this->reading(3.5));

        $this->assertNotNull($alert);
        $this->assertEquals('critical', $alert->severity);
    }

    public function test_duplicate_active_alert_not_created(): void
    {
        $this->service->evaluateReading($this->sensor, $this->reading(2.0));
        $second = $this->service->evaluateReading($this->sensor, $this->reading(2.1));

        $this->assertNull($second);
        $this->assertDatabaseCount('alerts', 1);
    }

    public function test_escalation_from_warning_to_critical_creates_new_alert(): void
    {
        $this->service->evaluateReading($this->sensor, $this->reading(2.0));
        $critical = $this->service->evaluateReading($this->sensor, $this->reading(3.5));

        $this->assertNotNull($critical);
        $this->assertEquals('critical', $critical->severity);
        $this->assertDatabaseCount('alerts', 2);
    }

    public function test_escalation_supersedes_the_warning_alert(): void
    {
        $warning = $this->service->evaluateReading($this->sensor, $this->reading(2.0));
        $this->service->evaluateReading($this->sensor, $this->reading(3.5));

        $this->assertSame('resolved', $warning->fresh()->status);
        $this->assertSame(1, Alert::active()->count());
    }

    public function test_falling_back_to_warning_does_not_raise_a_second_alert(): void
    {
        $this->service->evaluateReading($this->sensor, $this->reading(3.5));

        $this->assertNull($this->service->evaluateReading($this->sensor, $this->reading(2.0)));
        $this->assertDatabaseCount('alerts', 1);
    }

    public function test_an_offline_alert_does_not_block_a_flood_warning(): void
    {
        Alert::create([
            'flood_zone_id' => $this->zone->id, 'sensor_id' => $this->sensor->id, 'severity' => 'warning',
            'title' => 'Sensor offline: test', 'message' => 'offline', 'water_level' => null,
            'status' => 'active', 'source' => 'automatic',
        ]);

        $this->assertNotNull($this->service->evaluateReading($this->sensor, $this->reading(2.0)));
    }

    public function test_alert_dispatches_notifications_to_zone_residents(): void
    {
        User::factory()->resident()->create(['barangay' => 'Tayud']);
        User::factory()->resident()->create(['barangay' => 'Casili']);
        User::factory()->staff()->create();

        $alert = $this->service->evaluateReading($this->sensor, $this->reading(3.5));

        // Tayud resident + staff = 2 recipients (Casili resident excluded)
        $this->assertEquals(2, $alert->recipients()->count());
    }

    public function test_alert_dispatch_sends_branded_email_to_recipients(): void
    {
        Mail::fake();

        $resident = User::factory()->resident()->create([
            'barangay' => 'Tayud',
            'notification_preference' => ['sms' => false, 'email' => true, 'push' => false],
        ]);

        $alert = $this->service->evaluateReading($this->sensor, $this->reading(3.5));

        Mail::assertSent(AlertNotificationMail::class, fn ($mail) => $mail->hasTo($resident->email));

        $this->assertDatabaseHas('notification_logs', [
            'alert_id' => $alert->id,
            'user_id' => $resident->id,
            'channel' => 'email',
            'status' => 'sent',
        ]);
    }

    public function test_resolve_marks_alert_resolved(): void
    {
        $alert = Alert::factory()->for($this->zone)->create(['status' => 'active']);
        $user = User::factory()->staff()->create();

        $this->service->resolve($alert, $user->id);

        $this->assertDatabaseHas('alerts', [
            'id' => $alert->id,
            'status' => 'resolved',
            'resolved_by' => $user->id,
        ]);
    }

    public function test_api_ingestion_triggers_alert(): void
    {
        $token = 'pipeline-device-token';
        $this->sensor->update(['api_token' => hash('sha256', $token)]);

        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 3.5,
        ], ['Authorization' => 'Bearer '.$token]);

        $response->assertCreated();
        $this->assertDatabaseHas('alerts', ['sensor_id' => $this->sensor->id, 'severity' => 'critical']);
    }
}
