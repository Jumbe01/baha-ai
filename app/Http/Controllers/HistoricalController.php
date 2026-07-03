<?php

namespace App\Http\Controllers;

use App\Models\FloodIncident;
use App\Models\SensorReading;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HistoricalController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $driver = DB::connection()->getDriverName();
        $dayExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m-%d', recorded_at)"
            : "TO_CHAR(recorded_at, 'YYYY-MM-DD')";

        $daily = SensorReading::select(
            DB::raw("$dayExpr as day"),
            DB::raw('AVG(water_level) as avg_water_level'),
            DB::raw('MAX(water_level) as max_water_level'),
            DB::raw('SUM(rainfall) as total_rainfall'),
        )
            ->whereBetween('recorded_at', [$from, $to.' 23:59:59'])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($r) => [
                'day' => $r->day,
                'avg_water_level' => round((float) $r->avg_water_level, 2),
                'max_water_level' => round((float) $r->max_water_level, 2),
                'total_rainfall' => round((float) $r->total_rainfall, 2),
            ]);

        $rainyDays = $daily->where('total_rainfall', '>', 0)->count();

        $summary = [
            'avgWaterLevel' => round((float) $daily->avg('avg_water_level'), 2),
            'totalRainfall' => round((float) $daily->sum('total_rainfall'), 1),
            'maxWaterLevel' => round((float) $daily->max('max_water_level'), 2),
            'rainyDays' => $rainyDays,
            'dryDays' => $daily->count() - $rainyDays,
            'floodEvents' => FloodIncident::whereBetween('occurred_at', [$from, $to.' 23:59:59'])->count(),
        ];

        return Inertia::render('Historical/Index', [
            'daily' => $daily,
            'summary' => $summary,
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }
}
