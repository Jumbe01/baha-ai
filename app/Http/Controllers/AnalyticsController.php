<?php

namespace App\Http\Controllers;

use App\Models\FloodIncident;
use App\Models\FloodZone;
use App\Models\SensorReading;
use App\Services\ReportExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $driver = DB::connection()->getDriverName();
        $dayExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m-%d', recorded_at)"
            : "TO_CHAR(recorded_at, 'YYYY-MM-DD')";

        $dailyReadings = SensorReading::select(
            DB::raw("$dayExpr as day"),
            DB::raw('AVG(water_level) as avg_water_level'),
            DB::raw('MAX(water_level) as max_water_level'),
            DB::raw('AVG(rainfall) as avg_rainfall'),
        )
            ->whereBetween('recorded_at', [$from, $to.' 23:59:59'])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($r) => [
                'day' => $r->day,
                'avg_water_level' => round((float) $r->avg_water_level, 2),
                'max_water_level' => round((float) $r->max_water_level, 2),
                'avg_rainfall' => round((float) $r->avg_rainfall, 2),
            ]);

        $incidents = FloodIncident::with('floodZone:id,name,barangay')
            ->whereBetween('occurred_at', [$from, $to.' 23:59:59'])
            ->orderBy('occurred_at', 'desc')
            ->get();

        $summary = [
            'totalIncidents' => $incidents->count(),
            'criticalIncidents' => $incidents->where('severity', 'critical')->count(),
            'totalAffected' => $incidents->sum('affected_residents'),
            'peakLevel' => round((float) $incidents->max('peak_water_level'), 2),
        ];

        $byZone = $incidents->groupBy('flood_zone_id')->map(fn ($group) => [
            'zone' => $group->first()->floodZone->name,
            'count' => $group->count(),
        ])->values();

        return Inertia::render('Analytics/Index', [
            'dailyReadings' => $dailyReadings,
            'incidents' => $incidents,
            'summary' => $summary,
            'byZone' => $byZone,
            'floodZones' => FloodZone::select('id', 'name')->orderBy('name')->get(),
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }

    public function export(Request $request, ReportExportService $service)
    {
        $request->validate([
            'format' => ['required', 'in:csv,pdf'],
        ]);

        $from = $request->input('from');
        $to = $request->input('to');

        return $request->input('format') === 'pdf'
            ? $service->incidentsPdf($from, $to)
            : $service->incidentsCsv($from, $to);
    }
}
