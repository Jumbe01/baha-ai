<?php

namespace Tests\Feature;

use App\Models\FloodReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FloodReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_resident_can_submit_a_flood_report(): void
    {
        $user = User::factory()->resident()->create(['barangay' => 'Tayud']);

        $response = $this->actingAs($user)->post(route('flood-reports.store'), [
            'severity' => 'severe',
            'description' => 'Waist-deep water along the main road.',
            'latitude' => 10.3667,
            'longitude' => 123.9567,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('flood_reports', [
            'user_id' => $user->id,
            'barangay' => 'Tayud',
            'severity' => 'severe',
            'status' => 'pending',
        ]);
    }

    public function test_flood_report_requires_description_and_valid_severity(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->actingAs($user)->post(route('flood-reports.store'), [
            'severity' => 'catastrophic',
            'description' => '',
        ]);

        $response->assertSessionHasErrors(['severity', 'description']);
        $this->assertDatabaseCount('flood_reports', 0);
    }

    public function test_guests_cannot_submit_reports(): void
    {
        $response = $this->post(route('flood-reports.store'), [
            'severity' => 'minor',
            'description' => 'Test',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_staff_can_view_reports_list(): void
    {
        $staff = User::factory()->staff()->create();
        FloodReport::create([
            'severity' => 'moderate',
            'description' => 'Rising water near the bridge.',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($staff)->get(route('flood-reports.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('FloodReports/Index')
            ->has('reports.data', 1)
            ->where('counts.pending', 1)
        );
    }

    public function test_residents_cannot_view_reports_list(): void
    {
        $resident = User::factory()->resident()->create();

        $this->actingAs($resident)->get(route('flood-reports.index'))->assertForbidden();
    }

    public function test_staff_can_update_report_status(): void
    {
        $staff = User::factory()->staff()->create();
        $report = FloodReport::create([
            'severity' => 'severe',
            'description' => 'Flooded street.',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($staff)->patch(route('flood-reports.update', $report), [
            'status' => 'resolved',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('flood_reports', ['id' => $report->id, 'status' => 'resolved']);
    }
}
