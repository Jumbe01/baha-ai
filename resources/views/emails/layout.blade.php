{{--
    Shared BahaAI email layout — table-based with inline styles for broad email
    client support. Child views provide @section('content'). Optional @section('preheader').
--}}
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{ $title ?? config('app.name', 'BahaAI') }}</title>
</head>
<body style="margin:0; padding:0; background-color:#eef2f7; -webkit-font-smoothing:antialiased;">
    {{-- Preheader (hidden preview text) --}}
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
        @yield('preheader')
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f7; padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">
                    {{-- Header --}}
                    <tr>
                        <td style="background-color:#0b1f3a; background-image:linear-gradient(180deg,#0d2547,#0b1f3a); border-radius:16px 16px 0 0; padding:28px 32px; text-align:center;">
                            <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif; font-size:26px; font-weight:700; letter-spacing:-0.5px; color:#ffffff;">
                                Baha<span style="color:#38bdf8;">AI</span>
                            </div>
                            <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; color:#94a3b8; margin-top:4px;">
                                IoT-Based Flood Alert System
                            </div>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="background-color:#ffffff; padding:32px; font-family:'Segoe UI',Helvetica,Arial,sans-serif; color:#334155; font-size:15px; line-height:1.6;">
                            @yield('content')
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#ffffff; border-radius:0 0 16px 16px; border-top:1px solid #eef2f7; padding:20px 32px; text-align:center; font-family:'Segoe UI',Helvetica,Arial,sans-serif; color:#94a3b8; font-size:12px; line-height:1.6;">
                            You are receiving this email because you use BahaAI flood alerts.<br>
                            &copy; {{ date('Y') }} BahaAI &middot; Always follow official advisories from your local authorities.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
