<?php

namespace Tests\Feature;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WaterLevelTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private FloodZone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->staff()->create();
        $this->zone = FloodZone::factory()->create();
    }

    public function test_index_shows_active_sensors(): void
    {
        Sensor::factory()->for($this->zone)->count(3)->create(['status' => 'active']);
        Sensor::factory()->for($this->zone)->create(['status' => 'inactive']);

        $response = $this->actingAs($this->user)->get(route('water-levels.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('WaterLevels/Index')
            ->has('sensors', 3)
        );
    }

    public function test_index_includes_risk_assessment(): void
    {
        $sensor = Sensor::factory()->for($this->zone)->create(['status' => 'active']);
        SensorReading::factory()->for($sensor)->create(['water_level' => 0.5, 'recorded_at' => now()]);

        $response = $this->actingAs($this->user)->get(route('water-levels.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('sensors.0.risk')
            ->has('sensors.0.thresholds')
        );
    }

    public function test_index_water_level_is_numeric_not_string(): void
    {
        // Regression: decimal casts return strings, which crash the React
        // gauge's value.toFixed(). water_level must be serialized as a number.
        $sensor = Sensor::factory()->for($this->zone)->create(['status' => 'active']);
        SensorReading::factory()->for($sensor)->create(['water_level' => 1.25, 'recorded_at' => now()]);

        $response = $this->actingAs($this->user)->get(route('water-levels.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('sensors.0.water_level', 1.25)
            ->where('sensors.0.rainfall', fn ($v) => is_float($v) || is_int($v))
        );
    }

    public function test_show_water_level_is_numeric_not_string(): void
    {
        $sensor = Sensor::factory()->for($this->zone)->create(['status' => 'active']);
        SensorReading::factory()->for($sensor)->create(['water_level' => 2.5, 'recorded_at' => now()]);

        $response = $this->actingAs($this->user)->get(route('water-levels.show', $sensor));

        $response->assertInertia(fn ($page) => $page
            ->where('sensor.water_level', 2.5)
        );
    }

    public function test_show_displays_sensor_detail(): void
    {
        $sensor = Sensor::factory()->for($this->zone)->create();

        $response = $this->actingAs($this->user)->get(route('water-levels.show', $sensor));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('WaterLevels/Show')
            ->has('sensor')
            ->has('readings')
            ->has('hours')
        );
    }

    public function test_show_returns_readings_for_time_range(): void
    {
        $sensor = Sensor::factory()->for($this->zone)->create();
        SensorReading::factory()->for($sensor)->create([
            'recorded_at' => now()->subHours(2),
            'water_level' => 1.0,
        ]);
        SensorReading::factory()->for($sensor)->create([
            'recorded_at' => now()->subHours(30),
            'water_level' => 2.0,
        ]);

        $response = $this->actingAs($this->user)->get(route('water-levels.show', ['sensor' => $sensor, 'hours' => 6]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('readings', 1)
            ->where('hours', 6)
        );
    }

    public function test_show_clamps_hours_parameter(): void
    {
        $sensor = Sensor::factory()->for($this->zone)->create();

        $response = $this->actingAs($this->user)->get(route('water-levels.show', ['sensor' => $sensor, 'hours' => 999]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->where('hours', 168));
    }

    public function test_water_levels_require_authentication(): void
    {
        $response = $this->get(route('water-levels.index'));

        $response->assertRedirect(route('login'));
    }
}
