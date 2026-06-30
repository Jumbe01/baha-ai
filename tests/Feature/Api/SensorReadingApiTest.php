<?php

namespace Tests\Feature\Api;

use App\Models\FloodZone;
use App\Models\Sensor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SensorReadingApiTest extends TestCase
{
    use RefreshDatabase;

    private Sensor $sensor;

    protected function setUp(): void
    {
        parent::setUp();
        $floodZone = FloodZone::factory()->create();
        $this->sensor = Sensor::factory()->for($floodZone)->create();
    }

    public function test_can_store_sensor_reading(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.25,
            'rainfall' => 5.3,
            'temperature' => 28.5,
            'humidity' => 75.0,
        ]);

        $response->assertCreated();
        $response->assertJsonFragment(['water_level' => '1.25']);
        $this->assertDatabaseHas('sensor_readings', [
            'sensor_id' => $this->sensor->id,
            'water_level' => 1.25,
        ]);
    }

    public function test_store_updates_sensor_last_reading_at(): void
    {
        $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 2.0,
        ]);

        $this->sensor->refresh();
        $this->assertNotNull($this->sensor->last_reading_at);
    }

    public function test_store_validates_water_level_required(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('water_level');
    }

    public function test_store_validates_water_level_not_negative(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => -1.0,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('water_level');
    }

    public function test_store_validates_humidity_range(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.0,
            'humidity' => 150,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('humidity');
    }

    public function test_store_accepts_optional_recorded_at(): void
    {
        $timestamp = '2026-06-15 12:00:00';

        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.5,
            'recorded_at' => $timestamp,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('sensor_readings', [
            'sensor_id' => $this->sensor->id,
            'recorded_at' => $timestamp,
        ]);
    }
}
