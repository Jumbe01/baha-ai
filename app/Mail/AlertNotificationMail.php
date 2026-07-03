<?php

namespace App\Mail;

use App\Models\Alert;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlertNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $url;

    public function __construct(
        public Alert $alert,
        public string $userName,
    ) {
        $this->url = route('alerts.show', $alert->id);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: sprintf('[BahaAI %s] %s', strtoupper($this->alert->severity), $this->alert->title),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.alert',
            with: [
                'alert' => $this->alert,
                'userName' => $this->userName,
                'url' => $this->url,
            ],
        );
    }
}
