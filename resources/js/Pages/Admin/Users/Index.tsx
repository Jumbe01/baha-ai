import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Paginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Trash2, UserCircle } from 'lucide-react';
import { useState } from 'react';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    barangay: string | null;
    mobile: string | null;
    email_verified_at: string | null;
    created_at: string;
}

interface Props {
    users: Paginated<UserRow>;
    filters: { role?: string; search?: string };
}

const roleVariant: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
    admin: 'destructive' as never,
    staff: 'warning',
    resident: 'secondary',
};

export default function Index({ users, filters }: Props) {
    const { auth } = usePage().props as { auth: { user: { id: number } } };
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) => {
        router.get(route('admin.users.index'), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const deleteUser = (user: UserRow) => {
        if (confirm(`Delete ${user.name}? This cannot be undone.`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout header="User Management">
            <Head title="Users" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Manage system accounts and roles</p>
                <Link href={route('admin.users.create')}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <form onSubmit={submitSearch} className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </form>
                <select
                    value={filters.role ?? ''}
                    onChange={(e) => applyFilter('role', e.target.value)}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                    <option value="">All roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="resident">Resident</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Barangay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Verified</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.data.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <UserCircle className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={roleVariant[user.role] ?? 'secondary'}>{user.role}</Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{user.barangay ?? '-'}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={user.email_verified_at ? 'success' : 'secondary'}>
                                        {user.email_verified_at ? 'Verified' : 'Pending'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.id !== auth.user.id && (
                                        <Button variant="ghost" size="icon" onClick={() => deleteUser(user)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.data.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {users.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {users.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                            className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-white text-gray-600 hover:bg-gray-100' : 'cursor-default text-gray-300'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
