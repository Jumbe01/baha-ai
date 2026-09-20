import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { DoorOpen, Home, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useMemo } from 'react';

interface Center {
    id: number;
    name: string;
    barangay: string;
    address: string | null;
    capacity: number;
    current_occupancy: number;
    spaces_remaining: number;
    occupancy_percent: number;
    status: string;
    is_active: boolean;
    flood_zone?: { id: number; name: string } | null;
}

const STATUS_LEVEL: Record<string, 'safe' | 'moderate' | 'critical' | 'neutral'> = {
    open: 'safe',
    full: 'moderate',
    closed: 'critical',
};

export default function Index({ centers }: { centers: Center[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this evacuation center?')) {
            router.delete(route('admin.evacuation-centers.destroy', id));
        }
    };

    const stats = useMemo(() => {
        const capacity = centers.reduce((sum, c) => sum + c.capacity, 0);
        const occupied = centers.reduce((sum, c) => sum + c.current_occupancy, 0);
        const open = centers.filter((c) => c.status === 'open' && c.is_active).length;
        return { total: centers.length, open, capacity, available: capacity - occupied };
    }, [centers]);

    return (
        <AuthenticatedLayout>
            <Head title="Evacuation Centers" />

            <PageHeader
                title="Evacuation Centers"
                subtitle="Manage designated shelters, their capacity and availability."
                icon={
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                        <Home className="h-6 w-6 text-brand-500" />
                    </span>
                }
                actions={
                    <Link
                        href={route('admin.evacuation-centers.create')}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Center
                    </Link>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Centers" value={stats.total} icon={Home} tone="info" status={`${stats.total} registered`} />
                <StatCard label="Currently Open" value={stats.open} icon={DoorOpen} tone="safe" status={`${stats.total - stats.open} unavailable`} />
                <StatCard label="Total Capacity" value={stats.capacity} icon={Users} tone="info" status="Across all centers" />
                <StatCard label="Spaces Available" value={stats.available} icon={Users} tone="safe" status="Right now" />
            </div>

            <SectionCard title="Registered Centers" className="mt-6" flush>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-sm">
                        <thead>
                            <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Barangay</th>
                                <th className="px-5 py-3">Zone</th>
                                <th className="px-5 py-3">Occupancy</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {centers.map((center) => (
                                <tr key={center.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-navy-900">{center.name}</span>
                                        {center.address && <p className="text-xs text-slate-400">{center.address}</p>}
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{center.barangay}</td>
                                    <td className="px-5 py-4 text-slate-500">{center.flood_zone?.name ?? '—'}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full',
                                                        center.occupancy_percent >= 90
                                                            ? 'bg-red-500'
                                                            : center.occupancy_percent >= 70
                                                              ? 'bg-orange-400'
                                                              : 'bg-emerald-500',
                                                    )}
                                                    style={{ width: `${center.occupancy_percent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">
                                                {center.current_occupancy}/{center.capacity}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusBadge
                                            level={center.is_active ? (STATUS_LEVEL[center.status] ?? 'neutral') : 'neutral'}
                                            label={center.is_active ? center.status : 'inactive'}
                                            dot
                                        />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={route('admin.evacuation-centers.edit', center.id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600"
                                                aria-label="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(center.id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {centers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                        No evacuation centers registered yet. Click "Add Center" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </AuthenticatedLayout>
    );
}
