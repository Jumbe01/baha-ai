<?php

namespace Database\Factories;

use App\Models\Alert;
use App\Models\FloodZone;
use App\Models\Sensor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Alert>
 */
class AlertFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $severity = $this->faker->randomElement(['warning', 'critical']);

        return [
            'flood_zone_id' => FloodZone::factory(),
            'sensor_id' => Sensor::factory(),
            'severity' => $severity,
            'title' => ucfirst($severity).' water level detected',
            'message' => 'Water level has reached '.$severity.' threshold in the monitored zone.',
            'water_level' => $this->faker->randomFloat(2, 1.5, 5.0),
            'status' => 'active',
            'source' => 'automatic',
        ];
    }

    public function warning(): static
    {
        return $this->state(fn () => [
            'severity' => 'warning',
            'title' => 'Warning water level detected',
            'water_level' => $this->faker->randomFloat(2, 1.5, 2.9),
        ]);
    }

    public function critical(): static
    {
        return $this->state(fn () => [
            'severity' => 'critical',
            'title' => 'Critical water level detected',
            'water_level' => $this->faker->randomFloat(2, 3.0, 5.0),
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn () => [
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }

    public function manual(): static
    {
        return $this->state(fn () => [
            'source' => 'manual',
        ]);
    }
}
