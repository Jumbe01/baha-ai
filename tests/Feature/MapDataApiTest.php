<?php

namespace Tests\Feature;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MapDataApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_geojson_returns_feature_collection(): void
    {
        FloodZone::factory()->count(3)->create(['is_active' => true]);

        $response = $this->getJson(route('api.map.geojson'));

        $response->assertOk();
        $response->assertJsonPath('type', 'FeatureCollection');
        $response->assertJsonCount(3, 'features');
    }

    public function test_geojson_excludes_inactive_zones(): void
    {
        FloodZone::factory()->create(['is_active' => true]);
        FloodZone::factory()->create(['is_active' => false]);

        $response = $this->getJson(route('api.map.geojson'));

        $response->assertJsonCount(1, 'features');
    }

    public function test_geojson_feature_has_polygon_geometry(): void
    {
        FloodZone::factory()->create(['is_active' => true]);

        $response = $this->getJson(route('api.map.geojson'));

        $response->assertJsonPath('features.0.geometry.type', 'Polygon');
        $response->assertJsonPath('features.0.properties.risk', 'safe');
    }

    public function test_geojson_reflects_risk_from_readings(): void
    {
        $zone = FloodZone::factory()->create([
            'is_active' => true,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
        $sensor = Sensor::factory()->for($zone)->create();
        SensorReading::factory()->for($sensor)->create([
            'water_level' => 3.5,
            'recorded_at' => now(),
        ]);

        $response = $this->getJson(route('api.map.geojson'));

        $response->assertJsonPath('features.0.properties.risk', 'critical');
    }

    public function test_sensors_endpoint_returns_points(): void
    {
        $zone = FloodZone::factory()->create();
        Sensor::factory()->for($zone)->count(2)->create(['status' => 'active']);
        Sensor::factory()->for($zone)->create(['status' => 'inactive']);

        $response = $this->getJson(route('api.map.sensors'));

        $response->assertOk();
        $response->assertJsonPath('type', 'FeatureCollection');
        $response->assertJsonCount(2, 'features');
        $response->assertJsonPath('features.0.geometry.type', 'Point');
    }
}
