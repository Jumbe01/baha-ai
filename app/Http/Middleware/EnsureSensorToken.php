<?php

namespace App\Http\Middleware;

use App\Models\Sensor;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSensorToken
{
    /**
     * Authenticate a field device against the sensor it is posting to.
     *
     * Each sensor carries its own hashed token, so a compromised node can
     * only submit readings as itself rather than as any sensor in the network.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sensor = $request->route('sensor');

        if (! $sensor instanceof Sensor) {
            $sensor = Sensor::find($sensor);
        }

        $presented = $request->bearerToken();

        if (! $sensor || ! $sensor->api_token || ! $presented
            || ! hash_equals($sensor->api_token, hash('sha256', $presented))) {
            abort(401, 'Invalid or missing device token.');
        }

        return $next($request);
    }
}
