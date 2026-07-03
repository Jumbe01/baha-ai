<?php

namespace Tests\Feature;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Services\AlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SensorOfflineTest extends TestCase
{
    use RefreshDatabase;

    private AlertService $service;

    private FloodZone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AlertService::class);
        $this->zone = FloodZone::factory()->create(['barangay' => 'Tayud']);
    }

    public function test_offline_sensor_raises_an_alert(): void
    {
        Sensor::factory()->for($this->zone)->create([
            'status' => 'active',
            'last_reading_at' => now()->subHours(2),
        ]);

        $created = $this->service->flagOfflineSensors(30);

        $this->assertEquals(1, $created);
        $this->assertDatabaseHas('alerts', ['severity' => 'warning', 'status' => 'active']);
    }

    public function test_recent_sensor_is_not_flagged(): void
    {
        Sensor::factory()->for($this->zone)->create([
            'status' => 'active',
            'last_reading_at' => now()->subMinutes(5),
        ]);

        $this->assertEquals(0, $this->service->flagOfflineSensors(30));
        $this->assertDatabaseCount('alerts', 0);
    }

    public function test_offline_sensor_is_not_flagged_twice(): void
    {
        Sensor::factory()->for($this->zone)->create([
            'status' => 'active',
            'last_reading_at' => now()->subHours(2),
        ]);

        $this->service->flagOfflineSensors(30);
        $second = $this->service->flagOfflineSensors(30);

        $this->assertEquals(0, $second);
        $this->assertDatabaseCount('alerts', 1);
    }
}
