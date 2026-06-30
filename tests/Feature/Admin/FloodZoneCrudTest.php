<?php

namespace Tests\Feature\Admin;

use App\Models\FloodZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FloodZoneCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    private function validFloodZoneData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Zone',
            'description' => 'A test flood zone',
            'barangay' => 'Tayud',
            'safe_threshold' => 0,
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
            'coordinates' => [
                ['lat' => 10.3620, 'lng' => 123.9520],
                ['lat' => 10.3650, 'lng' => 123.9520],
                ['lat' => 10.3650, 'lng' => 123.9560],
                ['lat' => 10.3620, 'lng' => 123.9560],
                ['lat' => 10.3620, 'lng' => 123.9520],
            ],
        ], $overrides);
    }

    public function test_admin_can_view_flood_zones_index(): void
    {
        FloodZone::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.flood-zones.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/FloodZones/Index')
            ->has('floodZones', 3)
        );
    }

    public function test_admin_can_view_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.flood-zones.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Admin/FloodZones/Create'));
    }

    public function test_admin_can_create_flood_zone(): void
    {
        $data = $this->validFloodZoneData();

        $response = $this->actingAs($this->admin)->post(route('admin.flood-zones.store'), $data);

        $response->assertRedirect(route('admin.flood-zones.index'));
        $this->assertDatabaseHas('flood_zones', ['name' => 'Test Zone', 'barangay' => 'Tayud']);
    }

    public function test_admin_can_edit_flood_zone(): void
    {
        $zone = FloodZone::factory()->create();

        $response = $this->actingAs($this->admin)->get(route('admin.flood-zones.edit', $zone));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/FloodZones/Edit')
            ->has('floodZone')
        );
    }

    public function test_admin_can_update_flood_zone(): void
    {
        $zone = FloodZone::factory()->create();

        $data = $this->validFloodZoneData(['name' => 'Updated Zone']);

        $response = $this->actingAs($this->admin)->put(route('admin.flood-zones.update', $zone), $data);

        $response->assertRedirect(route('admin.flood-zones.index'));
        $this->assertDatabaseHas('flood_zones', ['id' => $zone->id, 'name' => 'Updated Zone']);
    }

    public function test_admin_can_delete_flood_zone(): void
    {
        $zone = FloodZone::factory()->create();

        $response = $this->actingAs($this->admin)->delete(route('admin.flood-zones.destroy', $zone));

        $response->assertRedirect(route('admin.flood-zones.index'));
        $this->assertDatabaseMissing('flood_zones', ['id' => $zone->id]);
    }

    public function test_store_validates_warning_threshold_greater_than_safe(): void
    {
        $data = $this->validFloodZoneData([
            'safe_threshold' => 2.0,
            'warning_threshold' => 1.0,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.flood-zones.store'), $data);

        $response->assertSessionHasErrors('warning_threshold');
    }

    public function test_store_validates_critical_threshold_greater_than_warning(): void
    {
        $data = $this->validFloodZoneData([
            'warning_threshold' => 3.0,
            'critical_threshold' => 2.0,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.flood-zones.store'), $data);

        $response->assertSessionHasErrors('critical_threshold');
    }

    public function test_non_admin_cannot_access_flood_zones(): void
    {
        $resident = User::factory()->resident()->create();

        $response = $this->actingAs($resident)->get(route('admin.flood-zones.index'));

        $response->assertForbidden();
    }
}
