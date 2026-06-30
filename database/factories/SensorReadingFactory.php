<?php

namespace Database\Factories;

use App\Models\Sensor;
use App\Models\SensorReading;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SensorReading>
 */
class SensorReadingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sensor_id' => Sensor::factory(),
            'water_level' => fake()->randomFloat(2, 0.1, 3.0),
            'rainfall' => fake()->randomFloat(2, 0, 50),
            'temperature' => fake()->randomFloat(2, 24, 35),
            'humidity' => fake()->randomFloat(2, 60, 95),
            'recorded_at' => now(),
        ];
    }

    public function safe(): static
    {
        return $this->state(fn () => [
            'water_level' => fake()->randomFloat(2, 0.1, 1.0),
        ]);
    }

    public function warning(): static
    {
        return $this->state(fn () => [
            'water_level' => fake()->randomFloat(2, 1.5, 2.5),
        ]);
    }

    public function critical(): static
    {
        return $this->state(fn () => [
            'water_level' => fake()->randomFloat(2, 3.0, 5.0),
        ]);
    }
}
