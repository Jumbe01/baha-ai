<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;

/**
 * Default driver. Records the message without transmitting it, so the system
 * can be demonstrated end-to-end without an SMS account or credits.
 *
 * It reports 'simulated' rather than 'sent' — the notification log must never
 * claim delivery for a message that never left the server.
 */
class LogSmsGateway implements SmsGateway
{
    public function send(string $mobile, string $message): SmsResult
    {
        Log::info('SMS (simulated)', [
            'to' => $mobile,
            'message' => $message,
        ]);

        return SmsResult::simulated();
    }

    public function isLive(): bool
    {
        return false;
    }
}
