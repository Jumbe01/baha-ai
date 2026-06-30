<?php

namespace Database\Factories;

use App\Models\FloodZone;
use App\Models\Sensor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sensor>
 */
class SensorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'flood_zone_id' => FloodZone::factory(),
            'name' => 'Sensor-'.fake()->unique()->numerify('###'),
            'type' => fake()->randomElement(['ultrasonic', 'rain_gauge', 'pressure']),
            'latitude' => fake()->latitude(10.35, 10.39),
            'longitude' => fake()->longitude(123.93, 123.97),
            'status' => 'active',
            'battery_level' => fake()->randomFloat(2, 50, 100),
            'last_reading_at' => now(),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'status' => 'inactive',
        ]);
    }
}
