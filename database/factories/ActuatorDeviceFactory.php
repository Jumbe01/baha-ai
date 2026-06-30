<?php

namespace Database\Factories;

use App\Models\ActuatorDevice;
use App\Models\FloodZone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActuatorDevice>
 */
class ActuatorDeviceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'flood_zone_id' => FloodZone::factory(),
            'name' => $this->faker->randomElement(['Pump', 'Siren', 'Floodgate', 'Valve']).'-'.$this->faker->unique()->numberBetween(100, 999),
            'type' => $this->faker->randomElement(['pump', 'siren', 'floodgate', 'valve']),
            'latitude' => $this->faker->randomFloat(7, 10.35, 10.39),
            'longitude' => $this->faker->randomFloat(7, 123.93, 123.97),
            'is_on' => false,
            'mode' => $this->faker->randomElement(['auto', 'manual']),
            'status' => 'operational',
        ];
    }

    public function on(): static
    {
        return $this->state(fn () => ['is_on' => true, 'last_activated_at' => now()]);
    }
}
