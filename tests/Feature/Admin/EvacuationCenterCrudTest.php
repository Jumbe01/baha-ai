<?php

namespace Tests\Feature\Admin;

use App\Models\EvacuationCenter;
use App\Models\FloodZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvacuationCenterCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private FloodZone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        $this->zone = FloodZone::factory()->create(['barangay' => 'Tayud']);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'flood_zone_id' => $this->zone->id,
            'name' => 'Tayud Elementary School',
            'barangay' => 'Tayud',
            'address' => 'Tayud, Consolacion, Cebu',
            'capacity' => 450,
            'current_occupancy' => 0,
            'latitude' => 10.3762,
            'longitude' => 123.9541,
            'contact_number' => '09171234567',
            'status' => 'open',
            'is_active' => true,
        ], $overrides);
    }

    public function test_admin_can_view_the_center_list(): void
    {
        EvacuationCenter::factory()->count(3)->create();

        $this->actingAs($this->admin)
            ->get(route('admin.evacuation-centers.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/EvacuationCenters/Index')
                ->has('centers', 3)
            );
    }

    public function test_admin_can_create_a_center(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.evacuation-centers.store'), $this->payload())
            ->assertRedirect(route('admin.evacuation-centers.index'));

        $this->assertDatabaseHas('evacuation_centers', [
            'name' => 'Tayud Elementary School',
            'barangay' => 'Tayud',
            'capacity' => 450,
        ]);
    }

    public function test_admin_can_update_a_center(): void
    {
        $center = EvacuationCenter::factory()->create(['capacity' => 100]);

        $this->actingAs($this->admin)
            ->put(route('admin.evacuation-centers.update', $center), $this->payload([
                'name' => 'Renamed Center',
                'capacity' => 500,
            ]))
            ->assertRedirect(route('admin.evacuation-centers.index'));

        $this->assertDatabaseHas('evacuation_centers', [
            'id' => $center->id,
            'name' => 'Renamed Center',
            'capacity' => 500,
        ]);
    }

    public function test_admin_can_delete_a_center(): void
    {
        $center = EvacuationCenter::factory()->create();

        $this->actingAs($this->admin)
            ->delete(route('admin.evacuation-centers.destroy', $center))
            ->assertRedirect(route('admin.evacuation-centers.index'));

        $this->assertDatabaseMissing('evacuation_centers', ['id' => $center->id]);
    }

    public function test_occupancy_cannot_exceed_capacity(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.evacuation-centers.store'), $this->payload([
                'capacity' => 100,
                'current_occupancy' => 250,
            ]))
            ->assertSessionHasErrors('current_occupancy');

        $this->assertDatabaseCount('evacuation_centers', 0);
    }

    public function test_status_must_be_a_known_value(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.evacuation-centers.store'), $this->payload(['status' => 'exploded']))
            ->assertSessionHasErrors('status');
    }

    public function test_non_admin_cannot_manage_centers(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)
            ->get(route('admin.evacuation-centers.index'))
            ->assertForbidden();

        $this->actingAs($staff)
            ->post(route('admin.evacuation-centers.store'), $this->payload())
            ->assertForbidden();
    }

    public function test_deleting_a_zone_keeps_its_centers(): void
    {
        $center = EvacuationCenter::factory()->for($this->zone)->create();

        $this->zone->delete();

        $this->assertDatabaseHas('evacuation_centers', [
            'id' => $center->id,
            'flood_zone_id' => null,
        ]);
    }
}
