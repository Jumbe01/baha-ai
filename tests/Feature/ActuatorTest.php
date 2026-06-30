<?php

namespace Tests\Feature;

use App\Models\ActuatorDevice;
use App\Models\FloodZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActuatorTest extends TestCase
{
    use RefreshDatabase;

    private FloodZone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->zone = FloodZone::factory()->create();
    }

    public function test_actuation_page_loads_for_staff(): void
    {
        $user = User::factory()->staff()->create();
        ActuatorDevice::factory()->for($this->zone)->count(3)->create();

        $response = $this->actingAs($user)->get(route('actuation.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Actuation/Index')
            ->has('devices', 3)
            ->has('logs')
        );
    }

    public function test_staff_can_toggle_device(): void
    {
        $user = User::factory()->staff()->create();
        $device = ActuatorDevice::factory()->for($this->zone)->create(['is_on' => false]);

        $response = $this->actingAs($user)->patch(route('actuation.toggle', $device));

        $response->assertRedirect();
        $this->assertTrue($device->fresh()->is_on);
        $this->assertDatabaseHas('actuator_logs', [
            'actuator_device_id' => $device->id,
            'action' => 'turned_on',
        ]);
    }

    public function test_toggle_logs_user_and_records_activation_time(): void
    {
        $user = User::factory()->staff()->create();
        $device = ActuatorDevice::factory()->for($this->zone)->create(['is_on' => false]);

        $this->actingAs($user)->patch(route('actuation.toggle', $device));

        $this->assertNotNull($device->fresh()->last_activated_at);
        $this->assertDatabaseHas('actuator_logs', [
            'actuator_device_id' => $device->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_staff_can_switch_mode(): void
    {
        $user = User::factory()->staff()->create();
        $device = ActuatorDevice::factory()->for($this->zone)->create(['mode' => 'auto']);

        $response = $this->actingAs($user)->patch(route('actuation.mode', $device), ['mode' => 'manual']);

        $response->assertRedirect();
        $this->assertEquals('manual', $device->fresh()->mode);
    }

    public function test_switch_mode_validates_value(): void
    {
        $user = User::factory()->staff()->create();
        $device = ActuatorDevice::factory()->for($this->zone)->create();

        $response = $this->actingAs($user)->patch(route('actuation.mode', $device), ['mode' => 'invalid']);

        $response->assertSessionHasErrors('mode');
    }

    public function test_resident_cannot_access_actuation(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->actingAs($user)->get(route('actuation.index'));

        $response->assertForbidden();
    }
}
