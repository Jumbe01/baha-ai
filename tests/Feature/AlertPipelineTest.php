<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use App\Services\AlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_alert_dispatches_notifications_to_zone_residents(): void
    {
        User::factory()->resident()->create(['barangay' => 'Tayud']);
        User::factory()->resident()->create(['barangay' => 'Casili']);
        User::factory()->staff()->create();

        $alert = $this->service->evaluateReading($this->sensor, $this->reading(3.5));

        // Tayud resident + staff = 2 recipients (Casili resident excluded)
        $this->assertEquals(2, $alert->recipients()->count());
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
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 3.5,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('alerts', ['sensor_id' => $this->sensor->id, 'severity' => 'critical']);
    }
}
