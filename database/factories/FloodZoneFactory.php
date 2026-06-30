<?php

namespace Database\Factories;

use App\Models\FloodZone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FloodZone>
 */
class FloodZoneFactory extends Factory
{
    public function definition(): array
    {
        $baseLat = 10.3667;
        $baseLng = 123.9567;

        return [
            'name' => fake()->unique()->randomElement([
                'Tayud River Basin',
                'Casili Creek Zone',
                'Lamac Flood Plain',
                'Pitogo Lowland',
                'Nangka River Bend',
                'Consolacion Main Channel',
                'Jugan Watershed',
                'Danglag Valley',
            ]),
            'description' => fake()->sentence(),
            'barangay' => fake()->randomElement([
                'Tayud', 'Casili', 'Lamac', 'Pitogo',
                'Nangka', 'Consolacion Poblacion', 'Jugan', 'Danglag',
            ]),
            'safe_threshold' => 0.00,
            'warning_threshold' => fake()->randomFloat(2, 1.0, 2.0),
            'critical_threshold' => fake()->randomFloat(2, 2.5, 4.0),
            'coordinates' => $this->generatePolygon($baseLat, $baseLng),
            'risk_level' => 'safe',
            'is_active' => true,
        ];
    }

    /**
     * @return array<int, array{lat: float, lng: float}>
     */
    private function generatePolygon(float $baseLat, float $baseLng): array
    {
        $centerLat = $baseLat + fake()->randomFloat(4, -0.02, 0.02);
        $centerLng = $baseLng + fake()->randomFloat(4, -0.02, 0.02);
        $points = [];

        for ($i = 0; $i < 5; $i++) {
            $angle = ($i / 5) * 2 * M_PI;
            $radius = fake()->randomFloat(4, 0.002, 0.005);
            $points[] = [
                'lat' => round($centerLat + $radius * cos($angle), 7),
                'lng' => round($centerLng + $radius * sin($angle), 7),
            ];
        }

        $points[] = $points[0];

        return $points;
    }
}
