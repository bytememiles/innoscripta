<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to {{ $appName }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            color: #007bff;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .welcome-text {
            color: #666;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            margin-bottom: 8px;
        }
        .cta {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">📰 {{ $appName }}</div>
            <div class="welcome-text">Your Personal News Aggregator</div>
        </div>

        <div class="content">
            <h1>Welcome, {{ $user->name }}! 🎉</h1>
            
            <p>Thank you for joining {{ $appName }}! We're excited to have you on board and help you stay informed with the latest news from around the world.</p>
            
            <div class="features">
                <h3>What you can do with {{ $appName }}:</h3>
                <ul>
                    <li><strong>Personalized News Feed</strong> - Get news tailored to your interests</li>
                    <li><strong>Multiple Sources</strong> - Access news from NewsAPI, NewsData.io, and NY Times</li>
                    <li><strong>Smart Filtering</strong> - Filter by category, source, date, and keywords</li>
                    <li><strong>Search & Discovery</strong> - Find exactly what you're looking for</li>
                    <li><strong>Stay Updated</strong> - Get the latest news as it happens</li>
                </ul>
            </div>

            <p>Your account has been successfully created with the email address: <strong>{{ $user->email }}</strong></p>

            @if(!$user->hasVerifiedEmail())
            <p><strong>Important:</strong> Please verify your email address to unlock all features and ensure you receive important updates.</p>
            @endif

            <div class="cta">
                <a href="{{ config('app.url') }}" class="button">Start Reading News</a>
            </div>
        </div>

        <div class="footer">
            <p>Best regards,<br>The {{ $appName }} Team</p>
            <p>If you have any questions, feel free to contact us at {{ config('mail.from.address') }}</p>
        </div>
    </div>
</body>
</html>
