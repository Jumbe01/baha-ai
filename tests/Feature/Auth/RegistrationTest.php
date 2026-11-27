<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'barangay' => 'Tayud',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('verification.otp', absolute: false));
    }

    public function test_registration_requires_a_consolacion_barangay(): void
    {
        $base = [
            'name' => 'Outsider',
            'email' => 'outsider@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $this->post('/register', $base)->assertSessionHasErrors('barangay');
        $this->post('/register', $base + ['barangay' => 'Lahug'])->assertSessionHasErrors('barangay');
        $this->assertGuest();
    }

    public function test_public_registration_cannot_choose_a_privileged_role(): void
    {
        $this->post('/register', [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'barangay' => 'Tayud',
            'role' => 'staff',
        ]);

        $this->assertDatabaseHas('users', ['email' => 'sneaky@example.com', 'role' => 'resident']);
    }

    public function test_location_outside_consolacion_is_rejected(): void
    {
        $user = \App\Models\User::factory()->create(['role' => 'resident']);

        // Cebu City (Lahug), outside the Consolacion box.
        $this->actingAs($user)
            ->patch(route('location.update'), ['barangay' => 'Tayud', 'latitude' => 10.33, 'longitude' => 123.89])
            ->assertSessionHasErrors('longitude');

        $this->actingAs($user)
            ->patch(route('location.update'), ['barangay' => 'Tayud', 'latitude' => 10.36, 'longitude' => 123.95])
            ->assertSessionHasNoErrors();
    }
}
