<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WeatherData;
use App\Services\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WeatherTest extends TestCase
{
    use RefreshDatabase;

    public function test_weather_page_loads(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->actingAs($user)->get(route('weather.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Weather/Index')
            ->has('weather')
            ->where('usingSimulatedData', true)
        );
    }

    public function test_service_creates_weather_record(): void
    {
        $service = app(WeatherService::class);

        $weather = $service->fetch();

        $this->assertDatabaseHas('weather_data', ['id' => $weather->id]);
        $this->assertNotNull($weather->temperature);
        $this->assertNotEmpty($weather->forecast);
    }

    public function test_service_returns_cached_weather_when_fresh(): void
    {
        $service = app(WeatherService::class);

        $first = $service->current();
        $second = $service->current();

        $this->assertEquals($first->id, $second->id);
        $this->assertDatabaseCount('weather_data', 1);
    }

    public function test_service_refetches_when_cache_stale(): void
    {
        WeatherData::factory()->create(['fetched_at' => now()->subHours(2)]);

        $service = app(WeatherService::class);
        $service->current(30);

        $this->assertDatabaseCount('weather_data', 2);
    }

    public function test_command_fetches_weather(): void
    {
        $this->artisan('weather:fetch')->assertSuccessful();

        $this->assertDatabaseCount('weather_data', 1);
    }
}
