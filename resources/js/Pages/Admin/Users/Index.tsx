import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatusBadge from '@/Components/StatusBadge';
import { StatusLevel } from '@/lib/status';
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

const roleLevel: Record<string, StatusLevel> = {
    admin: 'critical',
    staff: 'info',
    resident: 'neutral',
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
        <AuthenticatedLayout>
            <Head title="Users" />

            <PageHeader
                title="User Management"
                subtitle="Manage system accounts and roles."
                actions={
                    <Link
                        href={route('admin.users.create')}
                        className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add User
                    </Link>
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <form onSubmit={submitSearch} className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    />
                </form>
                <select
                    value={filters.role ?? ''}
                    onChange={(e) => applyFilter('role', e.target.value)}
                    className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                >
                    <option value="">All roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="resident">Resident</option>
                </select>
            </div>

            <SectionCard flush>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead>
                            <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3">Barangay</th>
                                <th className="px-5 py-3">Verified</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                                <UserCircle className="h-5 w-5 text-slate-400" />
                                            </span>
                                            <span className="font-semibold text-navy-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{user.email}</td>
                                    <td className="px-5 py-4">
                                        <StatusBadge level={roleLevel[user.role] ?? 'neutral'} label={user.role} />
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{user.barangay ?? '-'}</td>
                                    <td className="px-5 py-4">
                                        <StatusBadge
                                            level={user.email_verified_at ? 'safe' : 'neutral'}
                                            label={user.email_verified_at ? 'Verified' : 'Pending'}
                                        />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end">
                                            {user.id !== auth.user.id && (
                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                                                    aria-label="Delete user"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {users.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {users.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                link.active
                                    ? 'bg-brand-600 text-white'
                                    : link.url
                                      ? 'bg-white text-slate-600 hover:bg-slate-100'
                                      : 'cursor-default text-slate-300'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
