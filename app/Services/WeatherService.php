<?php

namespace App\Services;

use App\Models\WeatherData;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeatherService
{
    private const CONSOLACION_LAT = 10.3667;

    private const CONSOLACION_LNG = 123.9567;

    /**
     * Return the most recent weather snapshot, fetching fresh data if the
     * cached record is older than the cache TTL.
     */
    public function current(int $cacheMinutes = 30): WeatherData
    {
        $latest = WeatherData::latest('fetched_at')->first();

        if ($latest && $latest->fetched_at->gt(now()->subMinutes($cacheMinutes))) {
            return $latest;
        }

        return $this->fetch();
    }

    public function fetch(): WeatherData
    {
        $apiKey = config('services.openweathermap.key');

        $payload = $apiKey
            ? $this->fetchFromApi($apiKey)
            : $this->simulatePayload();

        return WeatherData::create($payload);
    }

    /**
     * @return array<string, mixed>
     */
    private function fetchFromApi(string $apiKey): array
    {
        try {
            $weather = Http::timeout(10)->get('https://api.openweathermap.org/data/2.5/weather', [
                'lat' => self::CONSOLACION_LAT,
                'lon' => self::CONSOLACION_LNG,
                'units' => 'metric',
                'appid' => $apiKey,
            ]);

            $forecast = Http::timeout(10)->get('https://api.openweathermap.org/data/2.5/forecast', [
                'lat' => self::CONSOLACION_LAT,
                'lon' => self::CONSOLACION_LNG,
                'units' => 'metric',
                'cnt' => 8,
                'appid' => $apiKey,
            ]);

            if ($weather->failed()) {
                return $this->simulatePayload();
            }

            $data = $weather->json();

            return [
                'location' => 'Consolacion',
                'latitude' => self::CONSOLACION_LAT,
                'longitude' => self::CONSOLACION_LNG,
                'temperature' => $data['main']['temp'] ?? null,
                'feels_like' => $data['main']['feels_like'] ?? null,
                'humidity' => $data['main']['humidity'] ?? null,
                'rainfall' => $data['rain']['1h'] ?? 0,
                'wind_speed' => $data['wind']['speed'] ?? null,
                'condition' => $data['weather'][0]['main'] ?? null,
                'description' => $data['weather'][0]['description'] ?? null,
                'icon' => $data['weather'][0]['icon'] ?? null,
                'forecast' => $this->parseForecast($forecast->json()),
                'fetched_at' => now(),
            ];
        } catch (\Throwable $e) {
            Log::warning('Weather API fetch failed, using simulated data', ['error' => $e->getMessage()]);

            return $this->simulatePayload();
        }
    }

    /**
     * @param  array<string, mixed>|null  $data
     * @return array<int, array<string, mixed>>
     */
    private function parseForecast(?array $data): array
    {
        if (! $data || ! isset($data['list'])) {
            return [];
        }

        return collect($data['list'])->map(fn ($item) => [
            'time' => $item['dt_txt'] ?? null,
            'temperature' => $item['main']['temp'] ?? null,
            'rainfall' => $item['rain']['3h'] ?? 0,
            'condition' => $item['weather'][0]['main'] ?? null,
            'icon' => $item['weather'][0]['icon'] ?? null,
        ])->all();
    }

    /**
     * Generate a plausible weather snapshot for demos when no API key is set.
     *
     * @return array<string, mixed>
     */
    private function simulatePayload(): array
    {
        $hour = (int) now()->format('G');
        $isRainy = mt_rand(1, 100) <= 40;

        $conditions = $isRainy
            ? [['Rain', 'light rain', '10d'], ['Thunderstorm', 'thunderstorm', '11d']]
            : [['Clouds', 'scattered clouds', '03d'], ['Clear', 'clear sky', '01d']];
        [$condition, $description, $icon] = $conditions[array_rand($conditions)];

        $temperature = round(27 + 4 * sin(2 * M_PI * ($hour - 14) / 24) + mt_rand(-10, 10) / 10, 2);

        $forecast = [];
        for ($i = 1; $i <= 8; $i++) {
            $fHour = ($hour + $i * 3) % 24;
            $forecast[] = [
                'time' => now()->addHours($i * 3)->format('Y-m-d H:i:s'),
                'temperature' => round(27 + 4 * sin(2 * M_PI * ($fHour - 14) / 24) + mt_rand(-10, 10) / 10, 2),
                'rainfall' => $isRainy ? round(mt_rand(0, 800) / 100, 2) : round(mt_rand(0, 100) / 100, 2),
                'condition' => $condition,
                'icon' => $icon,
            ];
        }

        return [
            'location' => 'Consolacion',
            'latitude' => self::CONSOLACION_LAT,
            'longitude' => self::CONSOLACION_LNG,
            'temperature' => $temperature,
            'feels_like' => round($temperature + mt_rand(10, 30) / 10, 2),
            'humidity' => $isRainy ? mt_rand(80, 95) : mt_rand(60, 80),
            'rainfall' => $isRainy ? round(mt_rand(50, 400) / 100, 2) : 0,
            'wind_speed' => round(mt_rand(10, 50) / 10, 2),
            'condition' => $condition,
            'description' => $description,
            'icon' => $icon,
            'forecast' => $forecast,
            'fetched_at' => now(),
        ];
    }
}
