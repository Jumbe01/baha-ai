<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\FloodZone;
use App\Models\NotificationLog;
use App\Models\User;
use App\Services\NotificationDispatcher;
use App\Services\Sms\LogSmsGateway;
use App\Services\Sms\SemaphoreSmsGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SmsGatewayTest extends TestCase
{
    use RefreshDatabase;

    private function alertForBarangay(string $barangay): Alert
    {
        $zone = FloodZone::factory()->create(['barangay' => $barangay]);

        return Alert::factory()->for($zone)->create([
            'severity' => 'critical',
            'water_level' => 3.4,
        ]);
    }

    private function resident(string $barangay): User
    {
        return User::factory()->resident()->create([
            'barangay' => $barangay,
            'mobile' => '09171234567',
            'notification_preference' => ['sms' => true, 'email' => false, 'push' => false],
        ]);
    }

    public function test_log_driver_is_the_default(): void
    {
        $this->assertInstanceOf(LogSmsGateway::class, app(SmsGateway::class));
        $this->assertFalse(app(SmsGateway::class)->isLive());
    }

    public function test_semaphore_driver_is_used_when_configured(): void
    {
        config([
            'services.sms.gateway' => 'semaphore',
            'services.sms.semaphore.key' => 'test-key',
        ]);
        $this->app->forgetInstance(SmsGateway::class);

        $gateway = app(SmsGateway::class);

        $this->assertInstanceOf(SemaphoreSmsGateway::class, $gateway);
        $this->assertTrue($gateway->isLive());
    }

    public function test_semaphore_is_not_used_without_a_key(): void
    {
        config([
            'services.sms.gateway' => 'semaphore',
            'services.sms.semaphore.key' => null,
        ]);
        $this->app->forgetInstance(SmsGateway::class);

        $this->assertInstanceOf(LogSmsGateway::class, app(SmsGateway::class));
    }

    public function test_simulated_sms_is_never_logged_as_sent(): void
    {
        $alert = $this->alertForBarangay('Tayud');
        $this->resident('Tayud');

        app(NotificationDispatcher::class)->dispatch($alert);

        $this->assertDatabaseHas('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'sms',
            'status' => 'simulated',
        ]);
        $this->assertDatabaseMissing('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'sms',
            'status' => 'sent',
        ]);
    }

    public function test_simulated_sms_has_no_delivery_timestamp(): void
    {
        $alert = $this->alertForBarangay('Tayud');
        $this->resident('Tayud');

        app(NotificationDispatcher::class)->dispatch($alert);

        $log = NotificationLog::where('channel', 'sms')->firstOrFail();

        $this->assertNull($log->sent_at, 'A simulated message must not carry a delivery receipt.');
    }

    public function test_live_gateway_records_a_real_send(): void
    {
        Http::fake([
            'api.semaphore.co/*' => Http::response([['message_id' => 987654]], 200),
        ]);

        config([
            'services.sms.gateway' => 'semaphore',
            'services.sms.semaphore.key' => 'test-key',
        ]);
        $this->app->forgetInstance(SmsGateway::class);

        $alert = $this->alertForBarangay('Tayud');
        $this->resident('Tayud');

        app(NotificationDispatcher::class)->dispatch($alert);

        $this->assertDatabaseHas('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'sms',
            'status' => 'sent',
        ]);
    }

    public function test_gateway_failure_is_recorded_as_failed(): void
    {
        Http::fake([
            'api.semaphore.co/*' => Http::response('Unauthorized', 401),
        ]);

        config([
            'services.sms.gateway' => 'semaphore',
            'services.sms.semaphore.key' => 'bad-key',
        ]);
        $this->app->forgetInstance(SmsGateway::class);

        $alert = $this->alertForBarangay('Tayud');
        $this->resident('Tayud');

        app(NotificationDispatcher::class)->dispatch($alert);

        $this->assertDatabaseHas('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'sms',
            'status' => 'failed',
        ]);
    }

    public function test_local_mobile_numbers_are_normalised_for_the_provider(): void
    {
        Http::fake(['api.semaphore.co/*' => Http::response([['message_id' => 1]], 200)]);

        $gateway = new SemaphoreSmsGateway('test-key');
        $gateway->send('0917 123 4567', 'test');

        Http::assertSent(fn ($request) => $request['number'] === '639171234567');
    }

    public function test_push_is_recorded_as_simulated_without_a_device(): void
    {
        $zone = FloodZone::factory()->create(['barangay' => 'Pitogo']);
        $alert = Alert::factory()->for($zone)->create(['severity' => 'critical', 'water_level' => 3.1]);

        User::factory()->resident()->create([
            'barangay' => 'Pitogo',
            'notification_preference' => ['sms' => false, 'email' => false, 'push' => true],
        ]);

        app(NotificationDispatcher::class)->dispatch($alert);

        $this->assertDatabaseHas('notification_logs', [
            'alert_id' => $alert->id,
            'channel' => 'push',
            'status' => 'simulated',
            'recipient' => 'no-device-registered',
        ]);
    }
}
