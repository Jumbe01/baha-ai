<?php

namespace Tests\Feature\Admin;

use App\Models\AuditLog;
use App\Models\EvacuationCenter;
use App\Models\FloodZone;
use App\Models\Sensor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_creating_a_record_is_audited(): void
    {
        $this->actingAs($this->admin);

        $zone = FloodZone::factory()->create(['name' => 'Tayud River Basin']);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'created',
            'auditable_type' => FloodZone::class,
            'auditable_id' => $zone->id,
            'label' => 'Tayud River Basin',
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_updating_a_record_captures_before_and_after(): void
    {
        $zone = FloodZone::factory()->create(['critical_threshold' => 3.0]);

        $this->actingAs($this->admin);
        $zone->update(['critical_threshold' => 4.5]);

        $log = AuditLog::where('action', 'updated')
            ->where('auditable_id', $zone->id)
            ->latest('id')
            ->firstOrFail();

        $this->assertEquals('3.00', (string) $log->changes['before']['critical_threshold']);
        $this->assertEquals('4.5', (string) $log->changes['after']['critical_threshold']);
    }

    public function test_deleting_a_record_is_audited(): void
    {
        $center = EvacuationCenter::factory()->create();

        $this->actingAs($this->admin);
        $center->delete();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'deleted',
            'auditable_type' => EvacuationCenter::class,
            'auditable_id' => $center->id,
        ]);
    }

    public function test_a_role_change_is_traceable(): void
    {
        $resident = User::factory()->resident()->create();

        $this->actingAs($this->admin);
        $resident->update(['role' => 'staff']);

        $log = AuditLog::where('auditable_type', User::class)
            ->where('auditable_id', $resident->id)
            ->where('action', 'updated')
            ->latest('id')
            ->firstOrFail();

        $this->assertSame('resident', $log->changes['before']['role']);
        $this->assertSame('staff', $log->changes['after']['role']);
        $this->assertSame($this->admin->id, $log->user_id);
    }

    public function test_sensitive_fields_are_redacted(): void
    {
        $this->actingAs($this->admin);

        $user = User::factory()->create();

        $log = AuditLog::where('auditable_type', User::class)
            ->where('auditable_id', $user->id)
            ->where('action', 'created')
            ->firstOrFail();

        $this->assertSame('[redacted]', $log->changes['after']['password']);
    }

    public function test_api_tokens_are_never_stored_in_the_trail(): void
    {
        $sensor = Sensor::factory()->create();

        $this->actingAs($this->admin);
        $sensor->update(['api_token' => hash('sha256', 'super-secret')]);

        $log = AuditLog::where('auditable_type', Sensor::class)
            ->where('action', 'updated')
            ->latest('id')
            ->firstOrFail();

        $this->assertSame('[redacted]', $log->changes['after']['api_token']);
        $this->assertStringNotContainsString('super-secret', json_encode($log->changes));
    }

    public function test_a_touch_that_changes_nothing_is_not_logged(): void
    {
        $zone = FloodZone::factory()->create();
        $this->actingAs($this->admin);

        AuditLog::query()->delete();
        $zone->update(['name' => $zone->name]);

        $this->assertDatabaseCount('audit_logs', 0);
    }

    public function test_system_changes_are_recorded_without_a_user(): void
    {
        // No actingAs — mimics a scheduled command
        $zone = FloodZone::factory()->create();

        $this->assertDatabaseHas('audit_logs', [
            'auditable_id' => $zone->id,
            'action' => 'created',
            'user_id' => null,
        ]);
    }

    public function test_admin_can_view_the_audit_log(): void
    {
        $this->actingAs($this->admin);
        FloodZone::factory()->count(3)->create();

        $this->get(route('admin.audit-logs.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AuditLogs/Index')
                ->has('logs.data')
            );
    }

    public function test_audit_log_can_be_filtered_by_action(): void
    {
        $this->actingAs($this->admin);

        $zone = FloodZone::factory()->create();
        $zone->update(['name' => 'Renamed']);

        $this->get(route('admin.audit-logs.index', ['action' => 'updated']))
            ->assertInertia(fn ($page) => $page
                ->where('logs.data.0.action', 'updated')
            );
    }

    public function test_non_admin_cannot_view_the_audit_log(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)
            ->get(route('admin.audit-logs.index'))
            ->assertForbidden();
    }
}
