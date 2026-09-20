<?php

namespace App\Services;

use App\Mail\AlertNotificationMail;
use App\Models\Alert;
use App\Models\NotificationLog;
use App\Models\User;
use App\Services\Sms\SmsGateway;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class NotificationDispatcher
{
    public function __construct(private SmsGateway $sms) {}

    /**
     * Dispatch notifications for an alert to all affected residents and staff.
     * Email is sent for real. SMS goes through the configured gateway, which
     * defaults to a simulating log driver. Push is not yet wired.
     *
     * @return array{notified: int, email_sent: int, email_failed: int}
     */
    public function dispatch(Alert $alert): array
    {
        $recipients = $this->resolveRecipients($alert);
        $emailSent = 0;
        $emailFailed = 0;

        foreach ($recipients as $user) {
            $alert->recipients()->firstOrCreate(['user_id' => $user->id]);

            ['email_sent' => $sent, 'email_failed' => $failed] = $this->logNotifications($alert, $user);
            $emailSent += $sent;
            $emailFailed += $failed;
        }

        return [
            'notified' => $recipients->count(),
            'email_sent' => $emailSent,
            'email_failed' => $emailFailed,
            'sirens' => $this->logSirens($alert),
        ];
    }

    /**
     * Record the sirens sounding for this alert.
     *
     * The devices themselves are driven by ActuatorSimulationService when the
     * zone crosses its threshold; this records that the audible channel was
     * used, so the Alert page shows every channel in one place.
     *
     * @return int Number of sirens active for this alert
     */
    private function logSirens(Alert $alert): int
    {
        $zone = $alert->floodZone;

        if (! $zone) {
            return 0;
        }

        $sirens = $zone->actuatorDevices()
            ->where('type', 'siren')
            ->where('is_on', true)
            ->get();

        $content = sprintf(
            '[BahaAI %s] Audible warning sounding in %s, %s.',
            strtoupper($alert->severity),
            $zone->name,
            $zone->barangay,
        );

        foreach ($sirens as $siren) {
            NotificationLog::create([
                'alert_id' => $alert->id,
                'user_id' => null,
                'channel' => 'siren',
                'recipient' => $siren->name,
                'content' => $content,
                // No physical siren is wired yet; the command is real, the
                // sound is not. Under-claim rather than over-claim.
                'status' => 'simulated',
                'sent_at' => null,
            ]);
        }

        return $sirens->count();
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

    /**
     * @return array{email_sent: int, email_failed: int}
     */
    private function logNotifications(Alert $alert, User $user): array
    {
        $preferences = $user->notification_preference ?? ['sms' => true, 'email' => true, 'push' => false];
        $emailSent = 0;
        $emailFailed = 0;

        $content = sprintf(
            '[BahaAI %s] %s - %s. Water level: %sm.',
            strtoupper($alert->severity),
            $alert->title,
            $alert->floodZone->name,
            $alert->water_level
        );

        if (($preferences['sms'] ?? false) && $user->mobile) {
            // Status comes from the gateway itself: 'sent' only when a live
            // driver transmitted, 'simulated' when the log driver stood in.
            $result = $this->sms->send($user->mobile, $content);
            $this->createLog($alert, $user, 'sms', $user->mobile, $content, $result->status);
        }

        if ($preferences['email'] ?? false) {
            $status = $this->sendEmail($alert, $user);
            $status === 'sent' ? $emailSent++ : $emailFailed++;
            $this->createLog($alert, $user, 'email', $user->email, $content, $status);
        }

        if ($preferences['push'] ?? false) {
            // Push has no service wired. Record the intended device target
            // (none yet) rather than the user's name, and never claim delivery.
            $this->createLog($alert, $user, 'push', 'no-device-registered', $content, 'simulated');
        }

        return ['email_sent' => $emailSent, 'email_failed' => $emailFailed];
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
            Log::warning('Alert email delivery failed — is the mail server (e.g. Mailpit) running?', [
                'alert_id' => $alert->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            // Graceful fallback: capture the message to the log mailer so its
            // contents are never silently lost when SMTP is unreachable.
            try {
                Mail::mailer('log')->to($user->email)->send(new AlertNotificationMail($alert, $user->name));
            } catch (Throwable) {
                // Nothing more we can do; the warning above is the record.
            }

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
            // Only a genuine transmission gets a timestamp; a simulated row
            // must not look like a delivery receipt.
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }
}
