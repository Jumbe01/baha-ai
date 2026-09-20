<?php

namespace App\Services\Sms;

interface SmsGateway
{
    /**
     * Attempt to deliver a message.
     *
     * @return SmsResult The outcome, including the status written to the notification log
     */
    public function send(string $mobile, string $message): SmsResult;

    /**
     * Whether this driver actually transmits, as opposed to simulating.
     */
    public function isLive(): bool;
}
