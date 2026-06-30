<?php

namespace Tests\Feature;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PredictionControllerTest extends TestCase
{
    use RefreshDatabase;

    private FloodZone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->zone = FloodZone::factory()->create([
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
        ]);
    }

    public function test_index_displays_predictions_page(): void
    {
        $user = User::factory()->staff()->create();
        Sensor::factory()->for($this->zone)->count(2)->create(['status' => 'active']);

        $response = $this->actingAs($user)->get(route('predictions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Predictions/Index')
            ->has('predictions', 2)
        );
    }

    public function test_staff_can_generate_predictions(): void
    {
        $user = User::factory()->staff()->create();
        $sensor = Sensor::factory()->for($this->zone)->create(['status' => 'active']);

        for ($i = 0; $i < 6; $i++) {
            SensorReading::factory()->for($sensor)->create([
                'water_level' => 0.5 + $i * 0.1,
                'recorded_at' => now()->subMinutes((6 - $i) * 15),
            ]);
        }

        $response = $this->actingAs($user)->post(route('predictions.generate'));

        $response->assertRedirect(route('predictions.index'));
        $this->assertDatabaseHas('predictions', ['sensor_id' => $sensor->id]);
    }

    public function test_resident_cannot_generate_predictions(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->actingAs($user)->post(route('predictions.generate'));

        $response->assertForbidden();
    }

    public function test_predictions_require_authentication(): void
    {
        $response = $this->get(route('predictions.index'));

        $response->assertRedirect(route('login'));
    }
}
