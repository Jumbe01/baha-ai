<?php

namespace Tests\Feature\Auth;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RegistrationOtpTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function registration_creates_user_and_sends_otp(): void
    {
        Mail::fake();

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('verification.otp'));

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'resident',
        ]);

        $this->assertDatabaseHas('otp_codes', [
            'user_id' => User::where('email', 'test@example.com')->first()->id,
        ]);

        Mail::assertSent(OtpMail::class);
    }

    #[Test]
    public function otp_verification_marks_email_as_verified(): void
    {
        $user = User::factory()->unverified()->create();

        $otp = OtpCode::create([
            'user_id' => $user->id,
            'code' => '123456',
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->actingAs($user)->post(route('verification.otp.verify'), [
            'code' => '123456',
        ]);

        $response->assertRedirect(route('dashboard'));

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNotNull($otp->fresh()->verified_at);
    }

    #[Test]
    public function expired_otp_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        OtpCode::create([
            'user_id' => $user->id,
            'code' => '123456',
            'expires_at' => now()->subMinute(),
        ]);

        $response = $this->actingAs($user)->post(route('verification.otp.verify'), [
            'code' => '123456',
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertNull($user->fresh()->email_verified_at);
    }

    #[Test]
    public function wrong_otp_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        OtpCode::create([
            'user_id' => $user->id,
            'code' => '123456',
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->actingAs($user)->post(route('verification.otp.verify'), [
            'code' => '000000',
        ]);

        $response->assertSessionHasErrors('code');
    }

    #[Test]
    public function otp_resend_creates_new_code_and_sends_email(): void
    {
        Mail::fake();

        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->post(route('verification.otp.resend'));

        $response->assertRedirect();

        $this->assertDatabaseCount('otp_codes', 1);
        Mail::assertSent(OtpMail::class);
    }

    #[Test]
    public function registration_includes_optional_fields(): void
    {
        Mail::fake();

        $this->post('/register', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'mobile' => '09171234567',
            'barangay' => 'Tayud',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'juan@example.com',
            'mobile' => '09171234567',
            'barangay' => 'Tayud',
        ]);
    }
}
