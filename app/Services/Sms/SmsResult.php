<?php

namespace App\Services\Sms;

/**
 * Outcome of an SMS send attempt.
 *
 * `status` is written verbatim to notification_logs, so the three values are
 * deliberately distinct: a simulated message must never be recorded as 'sent'.
 */
readonly class SmsResult
{
    private function __construct(
        public string $status,
        public ?string $reference = null,
        public ?string $error = null,
    ) {}

    public static function sent(?string $reference = null): self
    {
        return new self('sent', $reference);
    }

    public static function simulated(): self
    {
        return new self('simulated');
    }

    public static function failed(string $error): self
    {
        return new self('failed', null, $error);
    }

    public function wasDelivered(): bool
    {
        return $this->status === 'sent';
    }
}
