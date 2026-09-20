<?php

namespace App\Http\Controllers;

use App\Models\EvacuationCenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvacuationCenterController extends Controller
{
    /**
     * Show evacuation centres, nearest first when we know where the user is.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $centers = EvacuationCenter::with('floodZone:id,name')
            ->where('is_active', true)
            ->get()
            ->append(['spaces_remaining', 'occupancy_percent']);

        $latitude = $user->latitude !== null ? (float) $user->latitude : null;
        $longitude = $user->longitude !== null ? (float) $user->longitude : null;

        if ($latitude !== null && $longitude !== null) {
            $centers = $centers
                ->map(function (EvacuationCenter $center) use ($latitude, $longitude) {
                    $center->setAttribute('distance_km', $center->distanceFrom($latitude, $longitude));

                    return $center;
                })
                ->sortBy('distance_km')
                ->values();
        } else {
            // Without coordinates, surface the user's own barangay first.
            $centers = $centers
                ->sortByDesc(fn (EvacuationCenter $center) => $center->barangay === $user->barangay ? 1 : 0)
                ->values();
        }

        return Inertia::render('EvacuationCenters/Index', [
            'centers' => $centers,
            'userLocation' => $latitude !== null && $longitude !== null
                ? ['lat' => $latitude, 'lng' => $longitude]
                : null,
            'userBarangay' => $user->barangay,
        ]);
    }
}
