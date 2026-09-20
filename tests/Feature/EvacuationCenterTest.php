<?php

namespace Tests\Feature;

use App\Models\EvacuationCenter;
use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\SensorReading;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvacuationCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_residents_see_registered_centers(): void
    {
        $user = User::factory()->resident()->create(['latitude' => null, 'longitude' => null]);
        EvacuationCenter::factory()->count(3)->create();

        $this->actingAs($user)
            ->get(route('evacuation.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('EvacuationCenters/Index')
                ->has('centers', 3)
            );
    }

    public function test_inactive_centers_are_hidden_from_residents(): void
    {
        $user = User::factory()->resident()->create();
        EvacuationCenter::factory()->create(['is_active' => true]);
        EvacuationCenter::factory()->create(['is_active' => false]);

        $this->actingAs($user)
            ->get(route('evacuation.index'))
            ->assertInertia(fn ($page) => $page->has('centers', 1));
    }

    public function test_centers_are_sorted_nearest_first_when_location_is_known(): void
    {
        $user = User::factory()->resident()->create([
            'latitude' => 10.3600,
            'longitude' => 123.9500,
        ]);

        EvacuationCenter::factory()->create(['name' => 'Far', 'latitude' => 10.3900, 'longitude' => 123.9800]);
        EvacuationCenter::factory()->create(['name' => 'Near', 'latitude' => 10.3610, 'longitude' => 123.9510]);

        $this->actingAs($user)
            ->get(route('evacuation.index'))
            ->assertInertia(fn ($page) => $page
                ->where('centers.0.name', 'Near')
                ->where('centers.1.name', 'Far')
            );
    }

    public function test_distance_is_reported_when_location_is_known(): void
    {
        $user = User::factory()->resident()->create([
            'latitude' => 10.3600,
            'longitude' => 123.9500,
        ]);

        EvacuationCenter::factory()->create(['latitude' => 10.3610, 'longitude' => 123.9510]);

        $this->actingAs($user)
            ->get(route('evacuation.index'))
            ->assertInertia(fn ($page) => $page->whereNot('centers.0.distance_km', null));
    }

    public function test_spaces_remaining_is_exposed(): void
    {
        $user = User::factory()->resident()->create();
        EvacuationCenter::factory()->create(['capacity' => 200, 'current_occupancy' => 50]);

        $this->actingAs($user)
            ->get(route('evacuation.index'))
            ->assertInertia(fn ($page) => $page->where('centers.0.spaces_remaining', 150));
    }

    public function test_gps_alerts_route_to_the_nearest_open_center(): void
    {
        $staff = User::factory()->staff()->create();

        $zone = FloodZone::factory()->create([
            'barangay' => 'Tayud',
            'warning_threshold' => 1.5,
            'critical_threshold' => 3.0,
            'coordinates' => [
                ['lat' => 10.3600, 'lng' => 123.9500],
                ['lat' => 10.3600, 'lng' => 123.9520],
                ['lat' => 10.3620, 'lng' => 123.9520],
                ['lat' => 10.3620, 'lng' => 123.9500],
            ],
        ]);

        $sensor = Sensor::factory()->for($zone)->create();
        SensorReading::create([
            'sensor_id' => $sensor->id,
            'water_level' => 3.6,
            'recorded_at' => now(),
        ]);

        EvacuationCenter::factory()->create(['name' => 'Distant Shelter', 'latitude' => 10.3900, 'longitude' => 123.9900]);
        EvacuationCenter::factory()->create(['name' => 'Closest Shelter', 'latitude' => 10.3615, 'longitude' => 123.9512]);

        $this->actingAs($staff)
            ->get(route('gps-alerts.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('floodedZones.0.evacuation_center.name', 'Closest Shelter')
                ->has('floodedZones.0.evacuation_route', 2)
            );
    }

    public function test_full_centers_are_not_offered_as_a_destination(): void
    {
        $staff = User::factory()->staff()->create();

        $zone = FloodZone::factory()->create([
            'critical_threshold' => 3.0,
            'coordinates' => [
                ['lat' => 10.3600, 'lng' => 123.9500],
                ['lat' => 10.3600, 'lng' => 123.9520],
                ['lat' => 10.3620, 'lng' => 123.9520],
                ['lat' => 10.3620, 'lng' => 123.9500],
            ],
        ]);

        $sensor = Sensor::factory()->for($zone)->create();
        SensorReading::create([
            'sensor_id' => $sensor->id,
            'water_level' => 4.0,
            'recorded_at' => now(),
        ]);

        EvacuationCenter::factory()->full()->create(['name' => 'Full But Close', 'latitude' => 10.3610, 'longitude' => 123.9510]);
        EvacuationCenter::factory()->create(['name' => 'Open But Far', 'latitude' => 10.3800, 'longitude' => 123.9700]);

        $this->actingAs($staff)
            ->get(route('gps-alerts.index'))
            ->assertInertia(fn ($page) => $page
                ->where('floodedZones.0.evacuation_center.name', 'Open But Far')
            );
    }

    public function test_page_still_renders_with_no_centers_registered(): void
    {
        $user = User::factory()->resident()->create();

        $this->actingAs($user)
            ->get(route('evacuation.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('centers', 0));
    }
}
