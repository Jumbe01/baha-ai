<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\AlertRecipient;
use App\Models\FloodZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Alert $alert;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->resident()->create(['barangay' => 'Tayud']);
        $zone = FloodZone::factory()->create(['barangay' => 'Tayud']);
        $this->alert = Alert::factory()->for($zone)->create();
    }

    public function test_index_lists_user_notifications(): void
    {
        AlertRecipient::create(['alert_id' => $this->alert->id, 'user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->get(route('notifications.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->has('notifications.data', 1)
            ->where('unreadCount', 1)
        );
    }

    public function test_mark_read_updates_notification(): void
    {
        $recipient = AlertRecipient::create([
            'alert_id' => $this->alert->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->patch(route('notifications.read', $recipient));

        $response->assertRedirect();
        $this->assertNotNull($recipient->fresh()->read_at);
    }

    public function test_cannot_mark_other_users_notification_read(): void
    {
        $other = User::factory()->resident()->create();
        $recipient = AlertRecipient::create([
            'alert_id' => $this->alert->id,
            'user_id' => $other->id,
        ]);

        $response = $this->actingAs($this->user)->patch(route('notifications.read', $recipient));

        $response->assertForbidden();
    }

    public function test_mark_all_read(): void
    {
        $zone = $this->alert->floodZone;
        $alert2 = Alert::factory()->for($zone)->create();

        AlertRecipient::create(['alert_id' => $this->alert->id, 'user_id' => $this->user->id]);
        AlertRecipient::create(['alert_id' => $alert2->id, 'user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->patch(route('notifications.read-all'));

        $response->assertRedirect();
        $this->assertEquals(
            0,
            AlertRecipient::where('user_id', $this->user->id)->whereNull('read_at')->count()
        );
    }

    public function test_unread_count_shared_globally(): void
    {
        AlertRecipient::create(['alert_id' => $this->alert->id, 'user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->get(route('dashboard'));

        $response->assertInertia(fn ($page) => $page->where('unreadNotifications', 1));
    }
}
