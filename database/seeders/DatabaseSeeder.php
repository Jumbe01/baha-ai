<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@bahaai.test',
        ]);

        User::factory()->staff()->count(3)->create();

        User::factory()->resident()->count(20)->create();

        $this->call([
            FloodZoneSeeder::class,
            SensorSeeder::class,
            FloodIncidentSeeder::class,
            ActuatorSeeder::class,
        ]);
    }
}
