<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MiddlewareAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware(['web', 'auth', 'admin'])->get('/test-admin', fn () => 'admin-only');
        Route::middleware(['web', 'auth', 'staff'])->get('/test-staff', fn () => 'staff-only');
    }

    #[Test]
    public function admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/test-admin')->assertOk();
    }

    #[Test]
    public function staff_cannot_access_admin_routes(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->get('/test-admin')->assertForbidden();
    }

    #[Test]
    public function resident_cannot_access_admin_routes(): void
    {
        $resident = User::factory()->resident()->create();

        $this->actingAs($resident)->get('/test-admin')->assertForbidden();
    }

    #[Test]
    public function admin_can_access_staff_routes(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/test-staff')->assertOk();
    }

    #[Test]
    public function staff_can_access_staff_routes(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->get('/test-staff')->assertOk();
    }

    #[Test]
    public function resident_cannot_access_staff_routes(): void
    {
        $resident = User::factory()->resident()->create();

        $this->actingAs($resident)->get('/test-staff')->assertForbidden();
    }

    #[Test]
    public function guest_is_redirected_to_login(): void
    {
        $this->get('/dashboard')->assertRedirect(route('login'));
    }
}
