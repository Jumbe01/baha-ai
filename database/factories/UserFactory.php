<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'resident',
            'mobile' => fake()->phoneNumber(),
            'barangay' => fake()->randomElement([
                'Cabangahan', 'Canjulao', 'Casili', 'Consolacion Poblacion',
                'Danglag', 'Garing', 'Jugan', 'Lamac', 'Lanipga',
                'Nangka', 'Panas', 'Panoypoy', 'Pitogo', 'Sacsac',
                'Tayud', 'Tilhaong', 'Tolotolo', 'Tugbongan',
            ]),
            'address' => fake()->address(),
            'latitude' => fake()->latitude(10.35, 10.39),
            'longitude' => fake()->longitude(123.93, 123.97),
            'notification_preference' => [
                'email' => true,
                'sms' => true,
                'push' => false,
            ],
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    public function staff(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'staff',
        ]);
    }

    public function resident(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'resident',
        ]);
    }
}
