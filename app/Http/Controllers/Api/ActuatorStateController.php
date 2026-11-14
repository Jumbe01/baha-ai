<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActuatorDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only device state for the relay node to poll (assembly guide §2.3).
 * Unauthenticated: exposes on/off state only, no personal data. Per-device
 * tokens like the reading endpoint's are noted as future work.
 */
class ActuatorStateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $devices = ActuatorDevice::query()
            ->when($request->integer('zone'), fn ($query, $zone) => $query->where('flood_zone_id', $zone))
            ->orderBy('id')
            ->get(['id', 'name', 'type', 'is_on', 'mode', 'status']);

        return response()->json(['devices' => $devices]);
    }
}
