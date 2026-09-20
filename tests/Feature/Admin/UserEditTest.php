<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserEditTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Updated Name',
            'email' => 'updated@bahaai.test',
            'role' => 'staff',
            'mobile' => '09171234567',
            'barangay' => 'Tayud',
        ], $overrides);
    }

    public function test_admin_can_open_the_edit_screen(): void
    {
        $user = User::factory()->resident()->create();

        $this->actingAs($this->admin)
            ->get(route('admin.users.edit', $user))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Edit')
                ->where('user.id', $user->id)
            );
    }

    public function test_admin_can_change_a_users_role(): void
    {
        $user = User::factory()->resident()->create();

        $this->actingAs($this->admin)
            ->put(route('admin.users.update', $user), $this->payload(['role' => 'staff']))
            ->assertRedirect(route('admin.users.index'));

        $this->assertSame('staff', $user->fresh()->role);
    }

    public function test_password_is_unchanged_when_left_blank(): void
    {
        $user = User::factory()->resident()->create(['password' => Hash::make('original-password')]);
        $before = $user->password;

        $this->actingAs($this->admin)
            ->put(route('admin.users.update', $user), $this->payload())
            ->assertRedirect();

        $this->assertSame($before, $user->fresh()->password);
    }

    public function test_password_is_updated_when_supplied(): void
    {
        $user = User::factory()->resident()->create(['password' => Hash::make('original-password')]);

        $this->actingAs($this->admin)
            ->put(route('admin.users.update', $user), $this->payload([
                'password' => 'a-new-strong-password',
                'password_confirmation' => 'a-new-strong-password',
            ]))
            ->assertRedirect();

        $this->assertTrue(Hash::check('a-new-strong-password', $user->fresh()->password));
    }

    public function test_email_must_stay_unique_across_other_users(): void
    {
        User::factory()->create(['email' => 'taken@bahaai.test']);
        $user = User::factory()->resident()->create();

        $this->actingAs($this->admin)
            ->put(route('admin.users.update', $user), $this->payload(['email' => 'taken@bahaai.test']))
            ->assertSessionHasErrors('email');
    }

    public function test_a_user_can_keep_their_own_email(): void
    {
        $user = User::factory()->resident()->create(['email' => 'keep@bahaai.test']);

        $this->actingAs($this->admin)
            ->put(route('admin.users.update', $user), $this->payload(['email' => 'keep@bahaai.test']))
            ->assertSessionHasNoErrors();
    }

    public function test_an_admin_cannot_change_their_own_role(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.users.update', $this->admin), $this->payload([
                'email' => $this->admin->email,
                'role' => 'resident',
            ]))
            ->assertSessionHas('error');

        $this->assertSame('admin', $this->admin->fresh()->role);
    }

    public function test_role_must_be_a_known_value(): void
    {
        $user = User::factory()->resident()->create();

        $this->actingAs($this->admin)
            ->put(route('admin.users.update', $user), $this->payload(['role' => 'superuser']))
            ->assertSessionHasErrors('role');
    }

    public function test_staff_cannot_edit_users(): void
    {
        $staff = User::factory()->staff()->create();
        $user = User::factory()->resident()->create();

        $this->actingAs($staff)
            ->put(route('admin.users.update', $user), $this->payload())
            ->assertForbidden();
    }

    public function test_role_changes_appear_in_the_audit_log(): void
    {
        $user = User::factory()->resident()->create();

        $this->actingAs($this->admin)
            ->put(route('admin.users.update', $user), $this->payload(['role' => 'staff']));

        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'action' => 'updated',
            'user_id' => $this->admin->id,
        ]);
    }
}
