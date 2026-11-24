<?php

namespace Tests\Feature;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

/**
 * Non-numeric record IDs must be rejected by routing (404) before they reach
 * the database: PostgreSQL fails a bigint comparison with a 500. SQLite, used
 * by the test suite, would hide that, so these tests check route matching.
 */
class RouteIdPatternTest extends TestCase
{
    public static function nonNumericUrls(): array
    {
        return [
            'sensor reading api' => ['POST', '/api/sensors/abc/readings'],
            'water level detail' => ['GET', '/water-levels/abc'],
            'alert detail' => ['GET', '/alerts/12x'],
            'resolve alert' => ['PATCH', '/alerts/abc/resolve'],
            'actuator toggle' => ['PATCH', '/actuation/abc/toggle'],
            'flood report' => ['PATCH', '/flood-reports/abc'],
            'admin sensor edit' => ['GET', '/admin/sensors/abc/edit'],
            'admin user edit' => ['GET', '/admin/users/abc/edit'],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('nonNumericUrls')]
    public function test_non_numeric_ids_do_not_match_a_route(string $method, string $url): void
    {
        $this->expectException(NotFoundHttpException::class);

        Route::getRoutes()->match(Request::create($url, $method));
    }

    public function test_numeric_ids_still_match(): void
    {
        $route = Route::getRoutes()->match(Request::create('/api/sensors/42/readings', 'POST'));

        $this->assertSame('42', $route->parameter('sensor'));
    }
}
