<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\FloodIncident;
use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use App\Services\AlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FloodIncidentRecordingTest extends TestCase
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
            'name' => 'Tayud Riverside',
            'barangay' => 'Tayud',
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);

        $this->sensor = Sensor::factory()->for($this->zone)->create();
    }

    private function reading(float $level, float $rainfall, string $at): SensorReading
    {
        return SensorReading::create([
            'sensor_id' => $this->sensor->id,
            'water_level' => $level,
            'rainfall' => $rainfall,
            'recorded_at' => $at,
        ]);
    }

    public function test_resolving_a_flood_alert_creates_an_incident(): void
    {
        $alert = Alert::factory()->for($this->zone)->create([
            'sensor_id' => $this->sensor->id,
            'severity' => 'critical',
            'water_level' => 3.2,
            'status' => 'active',
            'created_at' => now()->subMinutes(90),
        ]);

        $this->service->resolve($alert);

        $this->assertDatabaseHas('flood_incidents', [
            'alert_id' => $alert->id,
            'flood_zone_id' => $this->zone->id,
            'severity' => 'critical',
        ]);
    }

    public function test_incident_figures_come_from_real_readings(): void
    {
        $alert = Alert::factory()->for($this->zone)->create([
            'sensor_id' => $this->sensor->id,
            'severity' => 'critical',
            'water_level' => 3.1,
            'status' => 'active',
            'created_at' => now()->subMinutes(60),
        ]);

        $this->reading(3.1, 12.0, now()->subMinutes(50)->toDateTimeString());
        $this->reading(4.4, 18.5, now()->subMinutes(30)->toDateTimeString());
        $this->reading(3.6, 4.5, now()->subMinutes(10)->toDateTimeString());

        $this->service->resolve($alert);

        $incident = FloodIncident::where('alert_id', $alert->id)->firstOrFail();

        $this->assertEquals(4.40, (float) $incident->peak_water_level, 'Peak should be the highest reading.');
        $this->assertEquals(35.00, (float) $incident->total_rainfall, 'Rainfall should be summed across the alert window.');
        $this->assertEqualsWithDelta(60, $incident->duration_minutes, 1);
    }

    public function test_readings_outside_the_alert_window_are_excluded(): void
    {
        $alert = Alert::factory()->for($this->zone)->create([
            'sensor_id' => $this->sensor->id,
            'severity' => 'warning',
            'water_level' => 1.8,
            'status' => 'active',
            'created_at' => now()->subMinutes(30),
        ]);

        $this->reading(9.9, 500.0, now()->subDays(3)->toDateTimeString());
        $this->reading(2.0, 10.0, now()->subMinutes(20)->toDateTimeString());

        $this->service->resolve($alert);

        $incident = FloodIncident::where('alert_id', $alert->id)->firstOrFail();

        $this->assertEquals(2.00, (float) $incident->peak_water_level);
        $this->assertEquals(10.00, (float) $incident->total_rainfall);
    }

    public function test_affected_residents_counts_residents_in_the_barangay(): void
    {
        User::factory()->resident()->count(4)->create(['barangay' => 'Tayud']);
        User::factory()->resident()->count(2)->create(['barangay' => 'Pitogo']);
        User::factory()->staff()->create(['barangay' => 'Tayud']);

        $alert = Alert::factory()->for($this->zone)->create([
            'sensor_id' => $this->sensor->id,
            'severity' => 'critical',
            'water_level' => 3.4,
            'status' => 'active',
        ]);

        $this->service->resolve($alert);

        $incident = FloodIncident::where('alert_id', $alert->id)->firstOrFail();

        $this->assertSame(4, $incident->affected_residents);
    }

    public function test_offline_sensor_alerts_do_not_become_flood_incidents(): void
    {
        $alert = Alert::factory()->for($this->zone)->create([
            'sensor_id' => $this->sensor->id,
            'severity' => 'warning',
            'title' => 'Sensor offline: '.$this->sensor->name,
            'water_level' => null,
            'status' => 'active',
        ]);

        $this->service->resolve($alert);

        $this->assertDatabaseCount('flood_incidents', 0);
    }

    public function test_resolving_twice_does_not_duplicate_the_incident(): void
    {
        $alert = Alert::factory()->for($this->zone)->create([
            'sensor_id' => $this->sensor->id,
            'severity' => 'critical',
            'water_level' => 3.5,
            'status' => 'active',
        ]);

        $this->service->resolve($alert);
        $this->service->resolve($alert);

        $this->assertDatabaseCount('flood_incidents', 1);
    }

    public function test_incident_appears_in_analytics_totals(): void
    {
        $staff = User::factory()->staff()->create();

        $alert = Alert::factory()->for($this->zone)->create([
            'sensor_id' => $this->sensor->id,
            'severity' => 'critical',
            'water_level' => 3.8,
            'status' => 'active',
            'created_at' => now()->subHour(),
        ]);

        $this->service->resolve($alert);

        $this->actingAs($staff)
            ->get(route('analytics.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Analytics/Index')
                ->where('summary.totalIncidents', 1)
            );
    }
}
