<?php

namespace Database\Factories;

use App\Models\EvacuationCenter;
use App\Models\FloodZone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvacuationCenter>
 */
class EvacuationCenterFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $capacity = $this->faker->numberBetween(80, 600);

        return [
            'flood_zone_id' => FloodZone::factory(),
            'name' => $this->faker->randomElement([
                'Elementary School', 'National High School', 'Barangay Gymnasium',
                'Covered Court', 'Multi-Purpose Hall',
            ]).' Evacuation Center',
            'barangay' => $this->faker->randomElement(['Tayud', 'Casili', 'Jugan', 'Pitogo', 'Nangka', 'Garing']),
            'address' => $this->faker->streetAddress(),
            'capacity' => $capacity,
            'current_occupancy' => $this->faker->numberBetween(0, (int) ($capacity * 0.4)),
            'latitude' => $this->faker->randomFloat(7, 10.35, 10.39),
            'longitude' => $this->faker->randomFloat(7, 123.93, 123.97),
            'contact_number' => '09'.$this->faker->numerify('#########'),
            'status' => 'open',
            'is_active' => true,
        ];
    }

    public function full(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'full',
            'current_occupancy' => $attributes['capacity'] ?? 100,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn () => ['status' => 'closed']);
    }
}
