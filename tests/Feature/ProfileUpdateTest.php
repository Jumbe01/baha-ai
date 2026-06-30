<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/profile')
            ->assertOk();
    }

    #[Test]
    public function profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/profile', [
            'name' => 'Updated Name',
            'email' => $user->email,
            'mobile' => '09171234567',
            'address' => '123 Main St',
            'barangay' => 'Tayud',
            'notification_preference' => [
                'email' => true,
                'sms' => false,
                'push' => true,
            ],
        ]);

        $user->refresh();

        $this->assertSame('Updated Name', $user->name);
        $this->assertSame('09171234567', $user->mobile);
        $this->assertSame('123 Main St', $user->address);
        $this->assertSame('Tayud', $user->barangay);
        $this->assertFalse($user->notification_preference['sms']);
        $this->assertTrue($user->notification_preference['push']);
    }

    #[Test]
    public function email_change_resets_verification(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/profile', [
            'name' => $user->name,
            'email' => 'newemail@example.com',
        ]);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    #[Test]
    public function user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->delete('/profile', [
            'password' => 'password',
        ]);

        $this->assertGuest();
        $this->assertNull(User::find($user->id));
    }
}
