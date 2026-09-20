<?php

namespace Database\Seeders;

use App\Models\EvacuationCenter;
use App\Models\FloodZone;
use Illuminate\Database\Seeder;

class EvacuationCenterSeeder extends Seeder
{
    public function run(): void
    {
        $zones = FloodZone::all()->keyBy('barangay');

        // Designated shelters for the flood-prone barangays covered by the
        // system. Coordinates are approximate and should be replaced with
        // surveyed positions supplied by the Consolacion MDRRMO.
        $centers = [
            ['barangay' => 'Tayud', 'name' => 'Tayud Elementary School', 'capacity' => 450, 'lat' => 10.3762, 'lng' => 123.9541],
            ['barangay' => 'Tayud', 'name' => 'Consolacion Sports Complex', 'capacity' => 800, 'lat' => 10.3760, 'lng' => 123.9540],
            ['barangay' => 'Casili', 'name' => 'Casili Barangay Gymnasium', 'capacity' => 300, 'lat' => 10.3705, 'lng' => 123.9612],
            ['barangay' => 'Jugan', 'name' => 'Jugan National High School', 'capacity' => 600, 'lat' => 10.3688, 'lng' => 123.9489],
            ['barangay' => 'Lamac', 'name' => 'Lamac Multi-Purpose Hall', 'capacity' => 250, 'lat' => 10.3841, 'lng' => 123.9522],
            ['barangay' => 'Pitogo', 'name' => 'Pitogo Covered Court', 'capacity' => 280, 'lat' => 10.3594, 'lng' => 123.9583],
            ['barangay' => 'Nangka', 'name' => 'Nangka Elementary School', 'capacity' => 400, 'lat' => 10.3629, 'lng' => 123.9447],
            ['barangay' => 'Garing', 'name' => 'Garing Barangay Hall', 'capacity' => 200, 'lat' => 10.3877, 'lng' => 123.9601],
        ];

        foreach ($centers as $center) {
            EvacuationCenter::create([
                'flood_zone_id' => $zones->get($center['barangay'])?->id,
                'name' => $center['name'],
                'barangay' => $center['barangay'],
                'address' => sprintf('%s, Consolacion, Cebu', $center['barangay']),
                'capacity' => $center['capacity'],
                'current_occupancy' => 0,
                'latitude' => $center['lat'],
                'longitude' => $center['lng'],
                'contact_number' => '09'.rand(100000000, 999999999),
                'status' => 'open',
                'is_active' => true,
            ]);
        }
    }
}
