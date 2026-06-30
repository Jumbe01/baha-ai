<?php

namespace Tests\Feature;

use App\Models\FloodIncident;
use App\Models\FloodZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private FloodZone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->zone = FloodZone::factory()->create();
    }

    public function test_analytics_page_loads_for_staff(): void
    {
        $user = User::factory()->staff()->create();
        FloodIncident::factory()->for($this->zone)->count(3)->create();

        $response = $this->actingAs($user)->get(route('analytics.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Analytics/Index')
            ->has('dailyReadings')
            ->has('incidents')
            ->has('summary')
        );
    }

    public function test_analytics_filters_incidents_by_date(): void
    {
        $user = User::factory()->staff()->create();
        FloodIncident::factory()->for($this->zone)->create(['occurred_at' => now()->subDays(5)]);
        FloodIncident::factory()->for($this->zone)->create(['occurred_at' => now()->subDays(60)]);

        $response = $this->actingAs($user)->get(route('analytics.index', [
            'from' => now()->subDays(10)->toDateString(),
            'to' => now()->toDateString(),
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('incidents', 1));
    }

    public function test_analytics_summary_counts_critical(): void
    {
        $user = User::factory()->staff()->create();
        FloodIncident::factory()->for($this->zone)->create(['severity' => 'critical', 'occurred_at' => now()]);
        FloodIncident::factory()->for($this->zone)->create(['severity' => 'warning', 'occurred_at' => now()]);

        $response = $this->actingAs($user)->get(route('analytics.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('summary.totalIncidents', 2)
            ->where('summary.criticalIncidents', 1)
        );
    }

    public function test_resident_cannot_access_analytics(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->actingAs($user)->get(route('analytics.index'));

        $response->assertForbidden();
    }

    public function test_csv_export_returns_download(): void
    {
        $user = User::factory()->staff()->create();
        FloodIncident::factory()->for($this->zone)->count(2)->create();

        $response = $this->actingAs($user)->get(route('analytics.export', ['format' => 'csv']));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_pdf_export_returns_download(): void
    {
        $user = User::factory()->staff()->create();
        FloodIncident::factory()->for($this->zone)->count(2)->create();

        $response = $this->actingAs($user)->get(route('analytics.export', ['format' => 'pdf']));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_export_validates_format(): void
    {
        $user = User::factory()->staff()->create();

        $response = $this->actingAs($user)->get(route('analytics.export', ['format' => 'xml']));

        $response->assertSessionHasErrors('format');
    }
}
