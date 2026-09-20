<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Semaphore (semaphore.co) — a Philippine SMS provider, chosen because it
 * delivers to local networks without needing an overseas sender number.
 *
 * Enable with SMS_GATEWAY=semaphore and SEMAPHORE_API_KEY=... in .env.
 */
class SemaphoreSmsGateway implements SmsGateway
{
    public function __construct(
        private string $apiKey,
        private ?string $senderName = null,
        private string $endpoint = 'https://api.semaphore.co/api/v4/messages',
    ) {}

    public function send(string $mobile, string $message): SmsResult
    {
        try {
            $response = Http::asForm()
                ->timeout(15)
                ->post($this->endpoint, array_filter([
                    'apikey' => $this->apiKey,
                    'number' => $this->normalise($mobile),
                    'message' => $message,
                    'sendername' => $this->senderName,
                ]));

            if ($response->failed()) {
                Log::warning('Semaphore SMS rejected the request', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return SmsResult::failed('HTTP '.$response->status());
            }

            $reference = $response->json('0.message_id');

            return SmsResult::sent($reference ? (string) $reference : null);
        } catch (Throwable $e) {
            Log::warning('Semaphore SMS delivery threw an exception', [
                'error' => $e->getMessage(),
            ]);

            return SmsResult::failed($e->getMessage());
        }
    }

    public function isLive(): bool
    {
        return true;
    }

    /**
     * Semaphore expects local 09XXXXXXXXX or 639XXXXXXXXX. Accept either and
     * strip the formatting people actually type.
     */
    private function normalise(string $mobile): string
    {
        $digits = preg_replace('/\D+/', '', $mobile) ?? '';

        if (str_starts_with($digits, '63')) {
            return $digits;
        }

        if (str_starts_with($digits, '0')) {
            return '63'.substr($digits, 1);
        }

        if (str_starts_with($digits, '9') && strlen($digits) === 10) {
            return '63'.$digits;
        }

        return $digits;
    }
}
