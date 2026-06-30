<?php

namespace Database\Factories;

use App\Models\FloodIncident;
use App\Models\FloodZone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FloodIncident>
 */
class FloodIncidentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $severity = $this->faker->randomElement(['warning', 'critical']);

        return [
            'flood_zone_id' => FloodZone::factory(),
            'severity' => $severity,
            'peak_water_level' => $severity === 'critical'
                ? $this->faker->randomFloat(2, 3.0, 5.5)
                : $this->faker->randomFloat(2, 1.5, 2.9),
            'total_rainfall' => $this->faker->randomFloat(2, 20, 180),
            'duration_minutes' => $this->faker->numberBetween(30, 480),
            'affected_residents' => $this->faker->numberBetween(0, 250),
            'description' => $this->faker->sentence(),
            'occurred_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
