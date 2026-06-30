<?php

namespace App\Services;

use App\Models\ActuatorDevice;
use App\Models\ActuatorLog;

class ActuatorSimulationService
{
    /**
     * Toggle a device on/off and record the action in its activity log.
     */
    public function toggle(ActuatorDevice $device, ?int $userId = null, string $trigger = 'manual'): ActuatorDevice
    {
        $device->update([
            'is_on' => ! $device->is_on,
            'last_activated_at' => ! $device->is_on ? now() : $device->last_activated_at,
        ]);

        $this->log(
            $device,
            $device->is_on ? 'turned_on' : 'turned_off',
            $userId,
            $trigger,
        );

        return $device;
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
