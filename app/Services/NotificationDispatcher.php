<?php

namespace App\Services;

use App\Mail\AlertNotificationMail;
use App\Models\Alert;
use App\Models\NotificationLog;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class NotificationDispatcher
{
    /**
     * Dispatch notifications for an alert to all affected residents and staff.
     * SMS/email/push delivery is simulated via database logging.
     *
     * @return int Number of recipients notified
     */
    public function dispatch(Alert $alert): int
    {
        $recipients = $this->resolveRecipients($alert);

        foreach ($recipients as $user) {
            $alert->recipients()->firstOrCreate(['user_id' => $user->id]);

            $this->logNotifications($alert, $user);
        }

        return $recipients->count();
    }

    /**
     * Find users who should receive this alert: residents in the affected
     * barangay plus all staff and admins.
     *
     * @return Collection<int, User>
     */
    public function resolveRecipients(Alert $alert): Collection
    {
        $barangay = $alert->floodZone->barangay;

        return User::query()
            ->where(function ($query) use ($barangay) {
                $query->where('role', 'resident')->where('barangay', $barangay);
            })
            ->orWhereIn('role', ['admin', 'staff'])
            ->get();
    }

    private function logNotifications(Alert $alert, User $user): void
    {
        $preferences = $user->notification_preference ?? ['sms' => true, 'email' => true, 'push' => false];

        $content = sprintf(
            '[BahaAI %s] %s - %s. Water level: %sm.',
            strtoupper($alert->severity),
            $alert->title,
            $alert->floodZone->name,
            $alert->water_level
        );

        if (($preferences['sms'] ?? false) && $user->mobile) {
            // SMS delivery is simulated (no gateway wired) — logged for the audit trail.
            $this->createLog($alert, $user, 'sms', $user->mobile, $content, 'sent');
        }

        if ($preferences['email'] ?? false) {
            $status = $this->sendEmail($alert, $user);
            $this->createLog($alert, $user, 'email', $user->email, $content, $status);
        }

        if ($preferences['push'] ?? false) {
            // Push delivery is simulated (no service wired) — logged for the audit trail.
            $this->createLog($alert, $user, 'push', $user->name, $content, 'sent');
        }
    }

    /**
     * Send the branded alert email. Returns 'sent' or 'failed' so delivery is
     * reflected accurately in the notification log.
     */
    private function sendEmail(Alert $alert, User $user): string
    {
        try {
            Mail::to($user->email)->send(new AlertNotificationMail($alert, $user->name));

            return 'sent';
        } catch (Throwable $e) {
            Log::warning('Alert email delivery failed', [
                'alert_id' => $alert->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return 'failed';
        }
    }

    private function createLog(Alert $alert, User $user, string $channel, string $recipient, string $content, string $status = 'sent'): void
    {
        NotificationLog::create([
            'alert_id' => $alert->id,
            'user_id' => $user->id,
            'channel' => $channel,
            'recipient' => $recipient,
            'content' => $content,
            'status' => $status,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }
}
