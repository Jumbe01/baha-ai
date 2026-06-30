<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\FloodZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlertControllerTest extends TestCase
{
    use RefreshDatabase;

    private FloodZone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->zone = FloodZone::factory()->create(['barangay' => 'Tayud']);
    }

    public function test_index_lists_alerts(): void
    {
        $user = User::factory()->staff()->create();
        Alert::factory()->for($this->zone)->count(3)->create();

        $response = $this->actingAs($user)->get(route('alerts.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Alerts/Index')
            ->has('alerts.data', 3)
        );
    }

    public function test_index_filters_by_severity(): void
    {
        $user = User::factory()->staff()->create();
        Alert::factory()->for($this->zone)->warning()->count(2)->create();
        Alert::factory()->for($this->zone)->critical()->count(1)->create();

        $response = $this->actingAs($user)->get(route('alerts.index', ['severity' => 'critical']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('alerts.data', 1));
    }

    public function test_index_filters_by_status(): void
    {
        $user = User::factory()->staff()->create();
        Alert::factory()->for($this->zone)->count(2)->create(['status' => 'active']);
        Alert::factory()->for($this->zone)->resolved()->count(3)->create();

        $response = $this->actingAs($user)->get(route('alerts.index', ['status' => 'resolved']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('alerts.data', 3));
    }

    public function test_show_displays_alert(): void
    {
        $user = User::factory()->resident()->create();
        $alert = Alert::factory()->for($this->zone)->create();

        $response = $this->actingAs($user)->get(route('alerts.show', $alert));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Alerts/Show')
            ->has('alert')
        );
    }

    public function test_staff_can_create_manual_alert(): void
    {
        $user = User::factory()->staff()->create();
        User::factory()->resident()->create(['barangay' => 'Tayud']);

        $response = $this->actingAs($user)->post(route('alerts.store'), [
            'flood_zone_id' => $this->zone->id,
            'severity' => 'warning',
            'title' => 'Manual flood warning',
            'message' => 'Please be cautious in low-lying areas.',
        ]);

        $response->assertRedirect(route('alerts.index'));
        $this->assertDatabaseHas('alerts', [
            'title' => 'Manual flood warning',
            'source' => 'manual',
            'created_by' => $user->id,
        ]);
    }

    public function test_resident_cannot_create_alert(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->actingAs($user)->post(route('alerts.store'), [
            'flood_zone_id' => $this->zone->id,
            'severity' => 'warning',
            'title' => 'Test',
            'message' => 'Test message',
        ]);

        $response->assertForbidden();
    }

    public function test_staff_can_resolve_alert(): void
    {
        $user = User::factory()->staff()->create();
        $alert = Alert::factory()->for($this->zone)->create(['status' => 'active']);

        $response = $this->actingAs($user)->patch(route('alerts.resolve', $alert));

        $response->assertRedirect();
        $this->assertDatabaseHas('alerts', ['id' => $alert->id, 'status' => 'resolved']);
    }

    public function test_resident_cannot_resolve_alert(): void
    {
        $user = User::factory()->resident()->create();
        $alert = Alert::factory()->for($this->zone)->create(['status' => 'active']);

        $response = $this->actingAs($user)->patch(route('alerts.resolve', $alert));

        $response->assertForbidden();
    }
}
