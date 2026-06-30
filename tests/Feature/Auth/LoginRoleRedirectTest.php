<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LoginRoleRedirectTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function verified_admin_is_redirected_to_dashboard(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();
    }

    #[Test]
    public function verified_staff_is_redirected_to_dashboard(): void
    {
        $user = User::factory()->staff()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
    }

    #[Test]
    public function verified_resident_is_redirected_to_dashboard(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
    }

    #[Test]
    public function unverified_user_is_redirected_to_otp_verification(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('verification.otp'));
    }

    #[Test]
    public function user_role_helpers_return_correct_values(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = User::factory()->staff()->create();
        $resident = User::factory()->resident()->create();

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isStaff());
        $this->assertFalse($admin->isResident());

        $this->assertFalse($staff->isAdmin());
        $this->assertTrue($staff->isStaff());
        $this->assertFalse($staff->isResident());

        $this->assertFalse($resident->isAdmin());
        $this->assertFalse($resident->isStaff());
        $this->assertTrue($resident->isResident());
    }
}
