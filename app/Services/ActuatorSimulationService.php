<?php

namespace App\Services;

use App\Models\ActuatorDevice;
use App\Models\ActuatorLog;
use App\Models\FloodZone;

class ActuatorSimulationService
{
    /**
     * Device types that engage automatically while a zone is at risk.
     * Pumps and drainage hardware run from the critical threshold; sirens
     * sound from warning level so residents get audible lead time.
     */
    private const AUTO_ON_AT = [
        'pump' => 'critical',
        'valve' => 'critical',
        'floodgate' => 'critical',
        'siren' => 'warning',
    ];

    /**
     * Drive every auto-mode device in a zone from its current risk level.
     *
     * Devices left in manual mode are never touched, and a device already in
     * the desired state is skipped so the activity log records transitions
     * rather than one row per evaluation cycle.
     *
     * @return int Number of devices whose state changed
     */
    public function evaluateZone(FloodZone $zone, string $riskLevel): int
    {
        $devices = $zone->actuatorDevices()
            ->where('mode', 'auto')
            ->where('status', 'operational')
            ->get();

        $changed = 0;

        foreach ($devices as $device) {
            $engageAt = self::AUTO_ON_AT[$device->type] ?? 'critical';
            $shouldBeOn = $this->riskMeets($riskLevel, $engageAt);

            if ($device->is_on === $shouldBeOn) {
                continue;
            }

            $this->setState(
                $device,
                $shouldBeOn,
                null,
                'automatic',
                sprintf('Zone risk %s — auto %s', $riskLevel, $shouldBeOn ? 'engaged' : 'released'),
            );

            $changed++;
        }

        return $changed;
    }

    /**
     * Is the current risk level at or above the level a device engages at?
     */
    private function riskMeets(string $current, string $engageAt): bool
    {
        $rank = ['safe' => 0, 'unknown' => 0, 'warning' => 1, 'critical' => 2];

        return ($rank[$current] ?? 0) >= ($rank[$engageAt] ?? 2);
    }

    /**
     * Put a device into an explicit state, logging only a real transition.
     */
    public function setState(
        ActuatorDevice $device,
        bool $on,
        ?int $userId = null,
        string $trigger = 'manual',
        ?string $notes = null,
    ): ActuatorDevice {
        $device->update([
            'is_on' => $on,
            'last_activated_at' => $on ? now() : $device->last_activated_at,
        ]);

        $this->log($device, $on ? 'turned_on' : 'turned_off', $userId, $trigger, $notes);

        return $device;
    }

    /**
     * Toggle a device on/off and record the action in its activity log.
     */
    public function toggle(ActuatorDevice $device, ?int $userId = null, string $trigger = 'manual'): ActuatorDevice
    {
        return $this->setState($device, ! $device->is_on, $userId, $trigger);
    }

    /**
     * Switch a device between automatic and manual control.
     */
    public function switchMode(ActuatorDevice $device, string $mode, ?int $userId = null): ActuatorDevice
    {
        $device->update(['mode' => $mode]);

        $this->log($device, "mode_{$mode}", $userId, 'manual', "Switched to {$mode} mode");

        return $device;
    }

    public function log(ActuatorDevice $device, string $action, ?int $userId, string $trigger, ?string $notes = null): ActuatorLog
    {
        return ActuatorLog::create([
            'actuator_device_id' => $device->id,
            'user_id' => $userId,
            'action' => $action,
            'trigger' => $trigger,
            'notes' => $notes,
            'logged_at' => now(),
        ]);
    }
}
