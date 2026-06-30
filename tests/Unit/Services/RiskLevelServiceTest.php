<?php

namespace Tests\Unit\Services;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Services\RiskLevelService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RiskLevelServiceTest extends TestCase
{
    use RefreshDatabase;

    private RiskLevelService $service;

    private FloodZone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RiskLevelService;
        $this->zone = FloodZone::factory()->create([
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
    }

    public function test_returns_safe_for_low_water_level(): void
    {
        $result = $this->service->forWaterLevel(0.5, $this->zone);

        $this->assertEquals('safe', $result['level']);
        $this->assertEquals('green', $result['color']);
    }

    public function test_returns_warning_for_medium_water_level(): void
    {
        $result = $this->service->forWaterLevel(2.0, $this->zone);

        $this->assertEquals('warning', $result['level']);
        $this->assertEquals('yellow', $result['color']);
    }

    public function test_returns_critical_for_high_water_level(): void
    {
        $result = $this->service->forWaterLevel(3.5, $this->zone);

        $this->assertEquals('critical', $result['level']);
        $this->assertEquals('red', $result['color']);
    }

    public function test_returns_warning_at_exact_threshold(): void
    {
        $result = $this->service->forWaterLevel(1.5, $this->zone);

        $this->assertEquals('warning', $result['level']);
    }

    public function test_returns_critical_at_exact_threshold(): void
    {
        $result = $this->service->forWaterLevel(3.0, $this->zone);

        $this->assertEquals('critical', $result['level']);
    }

    public function test_assess_returns_unknown_without_reading(): void
    {
        $sensor = Sensor::factory()->for($this->zone)->create();

        $result = $this->service->assess($sensor);

        $this->assertEquals('unknown', $result['level']);
        $this->assertEquals('No Data', $result['label']);
    }

    public function test_assess_uses_latest_reading(): void
    {
        $sensor = Sensor::factory()->for($this->zone)->create();
        SensorReading::factory()->for($sensor)->create(['water_level' => 2.0, 'recorded_at' => now()]);

        $sensor->load('latestReading');
        $result = $this->service->assess($sensor);

        $this->assertEquals('warning', $result['level']);
    }
}
