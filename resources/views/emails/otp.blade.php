@extends('emails.layout', ['title' => 'Verify your BahaAI account'])

@section('preheader', 'Your BahaAI verification code is ' . $code)

@section('content')
    <h1 style="margin:0 0 8px; font-size:20px; font-weight:700; color:#0b1f3a;">Verify your account</h1>
    <p style="margin:0 0 16px;">Hello {{ $userName }},</p>
    <p style="margin:0 0 20px;">Use the verification code below to finish setting up your BahaAI account:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="background-color:#eff6ff; border:1px solid #dbeafe; border-radius:12px; padding:20px;">
                <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif; font-size:34px; font-weight:700; letter-spacing:10px; color:#2563eb;">
                    {{ $code }}
                </div>
            </td>
        </tr>
    </table>

    <p style="margin:20px 0 0; font-size:14px; color:#64748b;">
        This code expires in <strong style="color:#334155;">10 minutes</strong>. For your security, do not share it with anyone.
    </p>
    <p style="margin:16px 0 0; font-size:13px; color:#94a3b8;">
        If you did not request this code, you can safely ignore this email.
    </p>
@endsection
