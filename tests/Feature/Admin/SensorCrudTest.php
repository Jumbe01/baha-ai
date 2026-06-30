<?php

namespace Tests\Feature\Admin;

use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SensorCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private FloodZone $floodZone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        $this->floodZone = FloodZone::factory()->create();
    }

    private function validSensorData(array $overrides = []): array
    {
        return array_merge([
            'flood_zone_id' => $this->floodZone->id,
            'name' => 'Test Sensor',
            'type' => 'ultrasonic',
            'latitude' => 10.3667,
            'longitude' => 123.9567,
        ], $overrides);
    }

    public function test_admin_can_view_sensors_index(): void
    {
        Sensor::factory()->for($this->floodZone)->count(3)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.sensors.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Sensors/Index')
            ->has('sensors', 3)
        );
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.sensors.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Sensors/Create')
            ->has('floodZones')
        );
    }

    public function test_admin_can_create_sensor(): void
    {
        $data = $this->validSensorData();

        $response = $this->actingAs($this->admin)->post(route('admin.sensors.store'), $data);

        $response->assertRedirect(route('admin.sensors.index'));
        $this->assertDatabaseHas('sensors', ['name' => 'Test Sensor', 'type' => 'ultrasonic']);
    }

    public function test_admin_can_update_sensor(): void
    {
        $sensor = Sensor::factory()->for($this->floodZone)->create();

        $data = $this->validSensorData([
            'name' => 'Updated Sensor',
            'status' => 'maintenance',
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.sensors.update', $sensor), $data);

        $response->assertRedirect(route('admin.sensors.index'));
        $this->assertDatabaseHas('sensors', ['id' => $sensor->id, 'name' => 'Updated Sensor', 'status' => 'maintenance']);
    }

    public function test_admin_can_delete_sensor(): void
    {
        $sensor = Sensor::factory()->for($this->floodZone)->create();

        $response = $this->actingAs($this->admin)->delete(route('admin.sensors.destroy', $sensor));

        $response->assertRedirect(route('admin.sensors.index'));
        $this->assertDatabaseMissing('sensors', ['id' => $sensor->id]);
    }

    public function test_store_validates_invalid_sensor_type(): void
    {
        $data = $this->validSensorData(['type' => 'invalid_type']);

        $response = $this->actingAs($this->admin)->post(route('admin.sensors.store'), $data);

        $response->assertSessionHasErrors('type');
    }

    public function test_store_validates_flood_zone_exists(): void
    {
        $data = $this->validSensorData(['flood_zone_id' => 9999]);

        $response = $this->actingAs($this->admin)->post(route('admin.sensors.store'), $data);

        $response->assertSessionHasErrors('flood_zone_id');
    }

    public function test_non_admin_cannot_access_sensors(): void
    {
        $staff = User::factory()->staff()->create();

        $response = $this->actingAs($staff)->get(route('admin.sensors.index'));

        $response->assertForbidden();
    }
}
