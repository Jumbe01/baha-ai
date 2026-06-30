<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\NotificationLog;
use App\Models\User;
use Illuminate\Support\Collection;

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
            $this->createLog($alert, $user, 'sms', $user->mobile, $content);
        }

        if ($preferences['email'] ?? false) {
            $this->createLog($alert, $user, 'email', $user->email, $content);
        }

        if ($preferences['push'] ?? false) {
            $this->createLog($alert, $user, 'push', $user->name, $content);
        }
    }

    private function createLog(Alert $alert, User $user, string $channel, string $recipient, string $content): void
    {
        NotificationLog::create([
            'alert_id' => $alert->id,
            'user_id' => $user->id,
            'channel' => $channel,
            'recipient' => $recipient,
            'content' => $content,
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }
}
