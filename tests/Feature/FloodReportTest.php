<?php

namespace Tests\Feature;

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
}
