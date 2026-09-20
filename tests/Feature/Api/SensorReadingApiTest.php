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

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $floodZone = FloodZone::factory()->create();
        $this->token = 'device-token-for-testing';
        $this->sensor = Sensor::factory()->for($floodZone)->create([
            'api_token' => hash('sha256', $this->token),
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function deviceHeaders(?string $token = null): array
    {
        return ['Authorization' => 'Bearer '.($token ?? $this->token)];
    }

    public function test_can_store_sensor_reading(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.25,
            'rainfall' => 5.3,
            'temperature' => 28.5,
            'humidity' => 75.0,
        ], $this->deviceHeaders());

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
        ], $this->deviceHeaders());

        $this->sensor->refresh();
        $this->assertNotNull($this->sensor->last_reading_at);
    }

    public function test_store_validates_water_level_required(): void
    {
        $response = $this->postJson(
            route('api.sensor-readings.store', $this->sensor),
            [],
            $this->deviceHeaders(),
        );

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('water_level');
    }

    public function test_store_validates_water_level_not_negative(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => -1.0,
        ], $this->deviceHeaders());

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('water_level');
    }

    public function test_store_validates_humidity_range(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.0,
            'humidity' => 150,
        ], $this->deviceHeaders());

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('humidity');
    }

    public function test_store_accepts_optional_recorded_at(): void
    {
        $timestamp = '2026-06-15 12:00:00';

        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 1.5,
            'recorded_at' => $timestamp,
        ], $this->deviceHeaders());

        $response->assertCreated();
        $this->assertDatabaseHas('sensor_readings', [
            'sensor_id' => $this->sensor->id,
            'recorded_at' => $timestamp,
        ]);
    }

    public function test_rejects_request_without_a_token(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 3.5,
        ]);

        $response->assertUnauthorized();
        $this->assertDatabaseCount('sensor_readings', 0);
    }

    public function test_rejects_request_with_an_incorrect_token(): void
    {
        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 3.5,
        ], $this->deviceHeaders('not-the-right-token'));

        $response->assertUnauthorized();
        $this->assertDatabaseCount('sensor_readings', 0);
    }

    public function test_rejects_a_token_belonging_to_a_different_sensor(): void
    {
        $other = Sensor::factory()->create([
            'api_token' => hash('sha256', 'another-device-token'),
        ]);

        $response = $this->postJson(route('api.sensor-readings.store', $other), [
            'water_level' => 3.5,
        ], $this->deviceHeaders());

        $response->assertUnauthorized();
        $this->assertDatabaseCount('sensor_readings', 0);
    }

    public function test_rejects_when_the_sensor_has_no_token_provisioned(): void
    {
        $unprovisioned = Sensor::factory()->create(['api_token' => null]);

        $response = $this->postJson(route('api.sensor-readings.store', $unprovisioned), [
            'water_level' => 3.5,
        ], $this->deviceHeaders());

        $response->assertUnauthorized();
        $this->assertDatabaseCount('sensor_readings', 0);
    }

    public function test_forged_critical_reading_cannot_trigger_the_alert_pipeline(): void
    {
        $this->sensor->floodZone->update(['critical_threshold' => 3.0]);

        $response = $this->postJson(route('api.sensor-readings.store', $this->sensor), [
            'water_level' => 9.9,
        ]);

        $response->assertUnauthorized();
        $this->assertDatabaseCount('alerts', 0);
        $this->assertDatabaseCount('notification_logs', 0);
    }
}
