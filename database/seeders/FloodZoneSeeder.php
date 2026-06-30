<?php

namespace Database\Seeders;

use App\Models\FloodZone;
use Illuminate\Database\Seeder;

class FloodZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'name' => 'Tayud River Basin',
                'description' => 'Main river basin area prone to flooding during heavy rainfall',
                'barangay' => 'Tayud',
                'safe_threshold' => 0,
                'warning_threshold' => 1.5,
                'critical_threshold' => 3.0,
                'coordinates' => [
                    ['lat' => 10.3620, 'lng' => 123.9520],
                    ['lat' => 10.3650, 'lng' => 123.9520],
                    ['lat' => 10.3650, 'lng' => 123.9560],
                    ['lat' => 10.3620, 'lng' => 123.9560],
                    ['lat' => 10.3620, 'lng' => 123.9520],
                ],
                'risk_level' => 'high',
            ],
            [
                'name' => 'Casili Creek Zone',
                'description' => 'Low-lying creek area with frequent water accumulation',
                'barangay' => 'Casili',
                'safe_threshold' => 0,
                'warning_threshold' => 1.2,
                'critical_threshold' => 2.5,
                'coordinates' => [
                    ['lat' => 10.3700, 'lng' => 123.9450],
                    ['lat' => 10.3730, 'lng' => 123.9450],
                    ['lat' => 10.3730, 'lng' => 123.9490],
                    ['lat' => 10.3700, 'lng' => 123.9490],
                    ['lat' => 10.3700, 'lng' => 123.9450],
                ],
                'risk_level' => 'medium',
            ],
            [
                'name' => 'Jugan Lowland',
                'description' => 'Flat residential area susceptible to flash floods',
                'barangay' => 'Jugan',
                'safe_threshold' => 0,
                'warning_threshold' => 1.0,
                'critical_threshold' => 2.0,
                'coordinates' => [
                    ['lat' => 10.3580, 'lng' => 123.9600],
                    ['lat' => 10.3610, 'lng' => 123.9600],
                    ['lat' => 10.3610, 'lng' => 123.9640],
                    ['lat' => 10.3580, 'lng' => 123.9640],
                    ['lat' => 10.3580, 'lng' => 123.9600],
                ],
                'risk_level' => 'high',
            ],
            [
                'name' => 'Lamac Valley',
                'description' => 'Valley area along mountain slopes with runoff risk',
                'barangay' => 'Lamac',
                'safe_threshold' => 0,
                'warning_threshold' => 2.0,
                'critical_threshold' => 4.0,
                'coordinates' => [
                    ['lat' => 10.3750, 'lng' => 123.9350],
                    ['lat' => 10.3780, 'lng' => 123.9350],
                    ['lat' => 10.3780, 'lng' => 123.9390],
                    ['lat' => 10.3750, 'lng' => 123.9390],
                    ['lat' => 10.3750, 'lng' => 123.9350],
                ],
                'risk_level' => 'medium',
            ],
            [
                'name' => 'Pitogo Riverside',
                'description' => 'Riverside residential area near main waterway',
                'barangay' => 'Pitogo',
                'safe_threshold' => 0,
                'warning_threshold' => 1.5,
                'critical_threshold' => 3.0,
                'coordinates' => [
                    ['lat' => 10.3680, 'lng' => 123.9580],
                    ['lat' => 10.3710, 'lng' => 123.9580],
                    ['lat' => 10.3710, 'lng' => 123.9620],
                    ['lat' => 10.3680, 'lng' => 123.9620],
                    ['lat' => 10.3680, 'lng' => 123.9580],
                ],
                'risk_level' => 'high',
            ],
            [
                'name' => 'Nangka Drainage Basin',
                'description' => 'Drainage basin area with moderate flood risk',
                'barangay' => 'Nangka',
                'safe_threshold' => 0,
                'warning_threshold' => 1.8,
                'critical_threshold' => 3.5,
                'coordinates' => [
                    ['lat' => 10.3550, 'lng' => 123.9500],
                    ['lat' => 10.3580, 'lng' => 123.9500],
                    ['lat' => 10.3580, 'lng' => 123.9540],
                    ['lat' => 10.3550, 'lng' => 123.9540],
                    ['lat' => 10.3550, 'lng' => 123.9500],
                ],
                'risk_level' => 'medium',
            ],
            [
                'name' => 'Garing Upland Channel',
                'description' => 'Upland channel with fast water flow during storms',
                'barangay' => 'Garing',
                'safe_threshold' => 0,
                'warning_threshold' => 1.0,
                'critical_threshold' => 2.5,
                'coordinates' => [
                    ['lat' => 10.3800, 'lng' => 123.9400],
                    ['lat' => 10.3830, 'lng' => 123.9400],
                    ['lat' => 10.3830, 'lng' => 123.9440],
                    ['lat' => 10.3800, 'lng' => 123.9440],
                    ['lat' => 10.3800, 'lng' => 123.9400],
                ],
                'risk_level' => 'low',
            ],
        ];

        foreach ($zones as $zone) {
            FloodZone::create($zone);
        }
    }
}
