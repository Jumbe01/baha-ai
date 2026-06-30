<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_view_users_index(): void
    {
        User::factory()->resident()->count(4)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 5) // 4 + admin
        );
    }

    public function test_index_filters_by_role(): void
    {
        User::factory()->staff()->count(2)->create();
        User::factory()->resident()->count(3)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.users.index', ['role' => 'staff']));

        $response->assertInertia(fn ($page) => $page->has('users.data', 2));
    }

    public function test_admin_can_create_user(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.users.store'), [
            'name' => 'New Staff',
            'email' => 'newstaff@bahaai.test',
            'role' => 'staff',
            'mobile' => '09171234567',
            'barangay' => 'Tayud',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', ['email' => 'newstaff@bahaai.test', 'role' => 'staff']);

        $user = User::where('email', 'newstaff@bahaai.test')->first();
        $this->assertTrue(Hash::check('Password123!', $user->password));
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_create_validates_unique_email(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.users.store'), [
            'name' => 'Duplicate',
            'email' => $this->admin->email,
            'role' => 'resident',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_admin_can_delete_user(): void
    {
        $user = User::factory()->resident()->create();

        $response = $this->actingAs($this->admin)->delete(route('admin.users.destroy', $user));

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('admin.users.destroy', $this->admin));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_staff_cannot_access_user_management(): void
    {
        $staff = User::factory()->staff()->create();

        $response = $this->actingAs($staff)->get(route('admin.users.index'));

        $response->assertForbidden();
    }
}
