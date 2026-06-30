<?php

namespace App\Services;

use App\Models\FloodZone;
use App\Models\Prediction;
use App\Models\Sensor;
use Illuminate\Support\Collection;

class PredictionService
{
    /**
     * Generate a flood prediction for a sensor using linear regression over
     * its recent readings. Estimates the rate of water-level rise, projects
     * time-to-critical, and derives a confidence score from the fit (R²).
     */
    public function generate(Sensor $sensor, int $lookbackMinutes = 120): ?Prediction
    {
        $sensor->loadMissing('floodZone');
        $zone = $sensor->floodZone;

        $readings = $sensor->readings()
            ->where('recorded_at', '>=', now()->subMinutes($lookbackMinutes))
            ->orderBy('recorded_at')
            ->get(['water_level', 'recorded_at']);

        if ($readings->count() < 3) {
            return null;
        }

        $baseTime = $readings->first()->recorded_at->getTimestamp();

        // x = minutes since first reading, y = water level
        $points = $readings->map(fn ($r) => [
            'x' => ($r->recorded_at->getTimestamp() - $baseTime) / 60,
            'y' => (float) $r->water_level,
        ]);

        $regression = $this->linearRegression($points);
        $slope = $regression['slope']; // metres per minute
        $intercept = $regression['intercept'];
        $rSquared = $regression['r_squared'];

        $currentLevel = (float) $readings->last()->water_level;
        $lastX = $points->last()['x'];

        // Project 60 minutes ahead
        $predictedLevel = $intercept + $slope * ($lastX + 60);

        $minutesToCritical = null;
        if ($slope > 0.0001 && $currentLevel < $zone->critical_threshold) {
            $minutesToCritical = (int) round(
                ($zone->critical_threshold - $currentLevel) / $slope
            );
        }

        $riskLevel = $this->classifyRisk($currentLevel, $predictedLevel, $minutesToCritical, $zone);
        $recommendation = $this->recommendation($riskLevel, $minutesToCritical);

        $forecastPoints = $this->buildForecast($intercept, $slope, $lastX, $currentLevel);

        return Prediction::create([
            'sensor_id' => $sensor->id,
            'flood_zone_id' => $zone->id,
            'current_level' => round($currentLevel, 2),
            'rate_of_rise' => round($slope, 4),
            'predicted_level' => round(max(0, $predictedLevel), 2),
            'minutes_to_critical' => $minutesToCritical,
            'confidence' => round($rSquared * 100, 2),
            'risk_level' => $riskLevel,
            'recommendation' => $recommendation,
            'forecast_points' => $forecastPoints,
            'generated_at' => now(),
        ]);
    }

    /**
     * @param  Collection<int, array{x: float, y: float}>  $points
     * @return array{slope: float, intercept: float, r_squared: float}
     */
    public function linearRegression(Collection $points): array
    {
        $n = $points->count();
        $sumX = $points->sum('x');
        $sumY = $points->sum('y');
        $sumXY = $points->sum(fn ($p) => $p['x'] * $p['y']);
        $sumX2 = $points->sum(fn ($p) => $p['x'] ** 2);

        $denominator = ($n * $sumX2) - ($sumX ** 2);

        if (abs($denominator) < 1e-10) {
            return ['slope' => 0.0, 'intercept' => $sumY / $n, 'r_squared' => 0.0];
        }

        $slope = (($n * $sumXY) - ($sumX * $sumY)) / $denominator;
        $intercept = ($sumY - ($slope * $sumX)) / $n;

        $meanY = $sumY / $n;
        $totalSS = $points->sum(fn ($p) => ($p['y'] - $meanY) ** 2);
        $residualSS = $points->sum(fn ($p) => ($p['y'] - ($intercept + $slope * $p['x'])) ** 2);

        $rSquared = $totalSS < 1e-10 ? 1.0 : max(0, 1 - ($residualSS / $totalSS));

        return [
            'slope' => $slope,
            'intercept' => $intercept,
            'r_squared' => $rSquared,
        ];
    }

    private function classifyRisk(float $current, float $predicted, ?int $minutesToCritical, FloodZone $zone): string
    {
        if ($current >= $zone->critical_threshold) {
            return 'critical';
        }

        if ($minutesToCritical !== null && $minutesToCritical <= 60) {
            return 'critical';
        }

        if ($predicted >= $zone->warning_threshold || $current >= $zone->warning_threshold) {
            return 'warning';
        }

        return 'safe';
    }

    private function recommendation(string $riskLevel, ?int $minutesToCritical): string
    {
        return match ($riskLevel) {
            'critical' => $minutesToCritical !== null
                ? "Immediate evacuation advised. Critical level projected in ~{$minutesToCritical} minutes."
                : 'Critical water level reached. Activate evacuation protocols immediately.',
            'warning' => 'Monitor closely and prepare for possible evacuation. Alert residents in low-lying areas.',
            default => 'Conditions stable. Continue routine monitoring.',
        };
    }

    /**
     * @return array<int, array{minute: int, level: float, predicted: bool}>
     */
    private function buildForecast(float $intercept, float $slope, float $lastX, float $currentLevel): array
    {
        $points = [];

        for ($i = 0; $i <= 120; $i += 15) {
            $level = $intercept + $slope * ($lastX + $i);
            $points[] = [
                'minute' => $i,
                'level' => round(max(0, $level), 2),
                'predicted' => $i > 0,
            ];
        }

        return $points;
    }
}
