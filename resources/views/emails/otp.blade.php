<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 480px; margin: 0 auto; padding: 20px; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; color: #2563eb; padding: 20px; background: #f0f9ff; border-radius: 8px; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Email Verification</h2>
        <p>Hello {{ $userName }},</p>
        <p>Your verification code for BahaAI is:</p>
        <div class="code">{{ $code }}</div>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
        <div class="footer">
            <p>If you did not request this code, please ignore this email.</p>
            <p>&mdash; BahaAI Flood Alert System</p>
        </div>
    </div>
</body>
</html>
