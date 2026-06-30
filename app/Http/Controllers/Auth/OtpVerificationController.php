<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\OtpCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OtpVerificationController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('Auth/VerifyOtp', [
            'email' => $request->user()->email,
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        $otpCode = OtpCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otpCode) {
            return back()->withErrors(['code' => 'Invalid or expired verification code.']);
        }

        $otpCode->update(['verified_at' => now()]);
        $user->forceFill(['email_verified_at' => now()])->save();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return redirect()->route('dashboard');
        }

        $recentOtp = OtpCode::where('user_id', $user->id)
            ->where('created_at', '>', now()->subMinute())
            ->exists();

        if ($recentOtp) {
            return back()->with('status', 'Please wait before requesting a new code.');
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new OtpMail($code, $user->name));

        return back()->with('status', 'A new verification code has been sent to your email.');
    }
}
