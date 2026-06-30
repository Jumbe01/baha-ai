<?php

namespace Database\Factories;

use App\Models\WeatherData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WeatherData>
 */
class WeatherDataFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'location' => 'Consolacion',
            'latitude' => 10.3667,
            'longitude' => 123.9567,
            'temperature' => $this->faker->randomFloat(2, 24, 33),
            'feels_like' => $this->faker->randomFloat(2, 24, 35),
            'humidity' => $this->faker->numberBetween(60, 95),
            'rainfall' => $this->faker->randomFloat(2, 0, 8),
            'wind_speed' => $this->faker->randomFloat(2, 1, 6),
            'condition' => $this->faker->randomElement(['Clear', 'Clouds', 'Rain']),
            'description' => 'scattered clouds',
            'icon' => '03d',
            'forecast' => [],
            'fetched_at' => now(),
        ];
    }
}
