@extends('emails.layout', ['title' => $alert->title])

@section('preheader', strtoupper($alert->severity) . ' — ' . $alert->title)

@php
    $accent = match ($alert->severity) {
        'critical' => '#ef4444',
        'warning' => '#f97316',
        default => '#2563eb',
    };
    $softBg = match ($alert->severity) {
        'critical' => '#fef2f2',
        'warning' => '#fff7ed',
        default => '#eff6ff',
    };
@endphp

@section('content')
    {{-- Severity banner --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
            <td style="background-color:{{ $softBg }}; border-left:4px solid {{ $accent }}; border-radius:8px; padding:14px 16px;">
                <span style="display:inline-block; font-size:12px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:{{ $accent }};">
                    {{ $alert->severity }} alert
                </span>
                <div style="font-size:18px; font-weight:700; color:#0b1f3a; margin-top:2px;">{{ $alert->title }}</div>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 20px;">Hello {{ $userName }},</p>
    <p style="margin:0 0 20px;">{{ $alert->message }}</p>

    {{-- Details --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef2f7; border-radius:12px; margin-bottom:24px;">
        @if ($alert->floodZone)
            <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #eef2f7; font-size:13px; color:#94a3b8;">Location</td>
                <td style="padding:12px 16px; border-bottom:1px solid #eef2f7; font-size:14px; font-weight:600; color:#0b1f3a; text-align:right;">
                    {{ $alert->floodZone->name }}, {{ $alert->floodZone->barangay }}
                </td>
            </tr>
        @endif
        @if (! is_null($alert->water_level))
            <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #eef2f7; font-size:13px; color:#94a3b8;">Water Level</td>
                <td style="padding:12px 16px; border-bottom:1px solid #eef2f7; font-size:14px; font-weight:700; color:{{ $accent }}; text-align:right;">
                    {{ $alert->water_level }} m
                </td>
            </tr>
        @endif
        <tr>
            <td style="padding:12px 16px; font-size:13px; color:#94a3b8;">Issued</td>
            <td style="padding:12px 16px; font-size:14px; font-weight:600; color:#0b1f3a; text-align:right;">
                {{ $alert->created_at?->format('M j, Y g:i A') }}
            </td>
        </tr>
    </table>

    {{-- CTA --}}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
            <td style="border-radius:10px; background-color:#2563eb;">
                <a href="{{ $url }}" style="display:inline-block; padding:12px 28px; font-family:'Segoe UI',Helvetica,Arial,sans-serif; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
                    View Alert Details
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:24px 0 0; font-size:13px; color:#94a3b8; text-align:center;">
        Stay safe and follow the instructions of your local disaster response authorities.
    </p>
@endsection
