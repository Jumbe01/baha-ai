<?php

namespace Tests\Feature\Services;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Services\PredictionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\TestCase;

class PredictionServiceTest extends TestCase
{
    use RefreshDatabase;

    private PredictionService $service;

    private FloodZone $zone;

    private Sensor $sensor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PredictionService;
        $this->zone = FloodZone::factory()->create([
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
        $this->sensor = Sensor::factory()->for($this->zone)->create();
    }

    /**
     * Seed readings rising linearly from $start at $stepPerReading per 15 min.
     */
    private function seedRisingReadings(float $start, float $stepPerReading, int $count = 8): void
    {
        for ($i = 0; $i < $count; $i++) {
            SensorReading::factory()->for($this->sensor)->create([
                'water_level' => round($start + $i * $stepPerReading, 2),
                'recorded_at' => now()->subMinutes(($count - $i) * 15),
            ]);
        }
    }

    public function test_returns_null_with_insufficient_readings(): void
    {
        SensorReading::factory()->for($this->sensor)->create([
            'water_level' => 1.0,
            'recorded_at' => now()->subMinutes(10),
        ]);

        $this->assertNull($this->service->generate($this->sensor));
    }

    public function test_generates_prediction_with_enough_readings(): void
    {
        $this->seedRisingReadings(0.5, 0.1);

        $prediction = $this->service->generate($this->sensor);

        $this->assertNotNull($prediction);
        $this->assertDatabaseHas('predictions', ['sensor_id' => $this->sensor->id]);
    }

    public function test_detects_positive_rate_of_rise(): void
    {
        $this->seedRisingReadings(0.5, 0.2);

        $prediction = $this->service->generate($this->sensor);

        $this->assertGreaterThan(0, (float) $prediction->rate_of_rise);
    }

    public function test_computes_minutes_to_critical_for_rising_water(): void
    {
        // Rising 0.2m every 15 min from 1.0; critical at 3.0
        $this->seedRisingReadings(1.0, 0.2);

        $prediction = $this->service->generate($this->sensor);

        $this->assertNotNull($prediction->minutes_to_critical);
        $this->assertGreaterThan(0, $prediction->minutes_to_critical);
    }

    public function test_high_confidence_for_perfectly_linear_data(): void
    {
        $this->seedRisingReadings(0.5, 0.15);

        $prediction = $this->service->generate($this->sensor);

        // Clean linear data should yield near-100% R²
        $this->assertGreaterThan(95, (float) $prediction->confidence);
    }

    public function test_stable_water_has_no_minutes_to_critical(): void
    {
        $this->seedRisingReadings(0.5, 0.0);

        $prediction = $this->service->generate($this->sensor);

        $this->assertNull($prediction->minutes_to_critical);
    }

    public function test_linear_regression_computes_known_slope(): void
    {
        $points = new Collection([
            ['x' => 0, 'y' => 0],
            ['x' => 1, 'y' => 2],
            ['x' => 2, 'y' => 4],
            ['x' => 3, 'y' => 6],
        ]);

        $result = $this->service->linearRegression($points);

        $this->assertEqualsWithDelta(2.0, $result['slope'], 0.0001);
        $this->assertEqualsWithDelta(0.0, $result['intercept'], 0.0001);
        $this->assertEqualsWithDelta(1.0, $result['r_squared'], 0.0001);
    }

    public function test_forecast_points_generated(): void
    {
        $this->seedRisingReadings(0.5, 0.1);

        $prediction = $this->service->generate($this->sensor);

        $this->assertNotEmpty($prediction->forecast_points);
        $this->assertCount(9, $prediction->forecast_points); // 0..120 step 15
    }
}
