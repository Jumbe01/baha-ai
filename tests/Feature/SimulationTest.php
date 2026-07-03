<?php

namespace Tests\Feature;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimulationTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_trigger_a_storm_simulation(): void
    {
        $staff = User::factory()->staff()->create();
        $zone = FloodZone::factory()->create(['barangay' => 'Tayud']);
        Sensor::factory()->for($zone)->create(['status' => 'active']);

        $response = $this->actingAs($staff)->post(route('simulation.storm'));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('sensor_readings', []);
    }

    public function test_residents_cannot_trigger_simulation(): void
    {
        $resident = User::factory()->resident()->create();

        $this->actingAs($resident)->post(route('simulation.storm'))->assertForbidden();
    }
}
