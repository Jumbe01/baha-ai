<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'mobile' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            // Service area: residents of Consolacion only.
            'barangay' => ['required', Rule::in(config('consolacion.barangays'))],
        ], [
            'barangay.required' => 'Select your barangay in Consolacion.',
            'barangay.in' => 'BahaAI currently serves residents of Consolacion only.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // Public sign-up always creates a resident. Staff/admin accounts are
            // created by an admin; a self-chosen role would be privilege escalation.
            'role' => 'resident',
            'mobile' => $request->mobile,
            'address' => $request->address,
            'barangay' => $request->barangay,
        ]);

        event(new Registered($user));

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new OtpMail($code, $user->name));

        Auth::login($user);

        return redirect()->route('verification.otp');
    }
}
