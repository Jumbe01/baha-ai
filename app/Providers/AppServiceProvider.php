<?php

namespace App\Providers;

use App\Services\Sms\LogSmsGateway;
use App\Services\Sms\SemaphoreSmsGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Resolve the SMS driver from config so a live gateway can be enabled
        // per-environment without touching the dispatch code or the tests.
        $this->app->singleton(SmsGateway::class, function () {
            $key = config('services.sms.semaphore.key');

            if (config('services.sms.gateway') === 'semaphore' && $key) {
                return new SemaphoreSmsGateway(
                    apiKey: $key,
                    senderName: config('services.sms.semaphore.sender_name'),
                );
            }

            return new LogSmsGateway;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // A field node posts every 5 minutes, so 60/min leaves generous headroom
        // while capping how fast a forged or malfunctioning client can inject
        // readings and trigger the alert pipeline.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(60)
            ->by($request->user()?->id ?: $request->ip()));
    }
}
