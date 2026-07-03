<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    private const PROVIDERS = ['google', 'facebook'];

    /**
     * Redirect the user to the OAuth provider's authorization page.
     */
    public function redirect(string $provider): RedirectResponse
    {
        if (! $this->isConfigured($provider)) {
            return redirect()->route('login')->with(
                'status',
                'Social login is not configured yet. Please use your email and password.',
            );
        }

        /** @phpstan-ignore-next-line — Socialite facade resolved at runtime once installed. */
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle the callback from the OAuth provider and sign the user in.
     */
    public function callback(string $provider): RedirectResponse
    {
        if (! $this->isConfigured($provider)) {
            return redirect()->route('login')->with('status', 'Social login is not configured yet.');
        }

        /** @phpstan-ignore-next-line */
        $oauthUser = Socialite::driver($provider)->user();

        $user = User::firstOrCreate(
            ['email' => $oauthUser->getEmail()],
            [
                'name' => $oauthUser->getName() ?: $oauthUser->getNickname() ?: 'BahaAI User',
                'password' => Hash::make(Str::random(32)),
                'role' => 'resident',
                'email_verified_at' => now(),
            ],
        );

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Whether Socialite is installed and the provider credentials are present.
     */
    private function isConfigured(string $provider): bool
    {
        return in_array($provider, self::PROVIDERS, true)
            && class_exists(Socialite::class)
            && filled(config("services.$provider.client_id"))
            && filled(config("services.$provider.client_secret"));
    }
}
