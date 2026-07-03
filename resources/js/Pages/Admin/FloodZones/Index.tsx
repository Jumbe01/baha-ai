import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { riskToStatus, statusStyle } from '@/lib/status';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, MapPin, Pencil, Plus, Radio, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface FloodZone {
    id: number;
    name: string;
    barangay: string;
    safe_threshold: number;
    warning_threshold: number;
    critical_threshold: number;
    risk_level: string;
    is_active: boolean;
    sensors_count: number;
}

export default function Index({ floodZones }: { floodZones: FloodZone[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this flood zone?')) {
            router.delete(route('admin.flood-zones.destroy', id));
        }
    };

    const stats = useMemo(() => {
        const total = floodZones.length;
        const active = floodZones.filter((z) => z.is_active).length;
        const sensors = floodZones.reduce((sum, z) => sum + z.sensors_count, 0);
        return { total, active, sensors };
    }, [floodZones]);

    return (
        <AuthenticatedLayout>
            <Head title="Flood Zones" />

            <PageHeader
                title="Flood Zones"
                subtitle="Manage flood monitoring zones across Consolacion."
                icon={
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                        <MapPin className="h-6 w-6 text-brand-500" />
                    </span>
                }
                actions={
                    <Link
                        href={route('admin.flood-zones.create')}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Flood Zone
                    </Link>
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Zones" value={stats.total} icon={MapPin} tone="info" status={`${stats.total} configured`} />
                <StatCard label="Active Zones" value={stats.active} icon={CheckCircle2} tone="safe" status={`${stats.total - stats.active} inactive`} />
                <StatCard label="Sensors Deployed" value={stats.sensors} icon={Radio} tone="info" status="Across all zones" />
            </div>

            <SectionCard title="Monitoring Zones" className="mt-6" flush>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead>
                            <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Barangay</th>
                                <th className="px-5 py-3">Thresholds (m)</th>
                                <th className="px-5 py-3">Sensors</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {floodZones.map((zone) => {
                                const level = riskToStatus(zone.risk_level);
                                const st = statusStyle(level);
                                return (
                                    <tr key={zone.id} className={cn('border-b border-l-4 border-slate-100 transition-colors hover:bg-slate-50', st.border)}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', st.softBg)}>
                                                    <MapPin className={cn('h-4 w-4', st.icon)} />
                                                </span>
                                                <span className="font-semibold text-navy-900">{zone.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">{zone.barangay}</td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 font-semibold">
                                                <span className="text-emerald-600">{zone.safe_threshold}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-orange-600">{zone.warning_threshold}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-red-600">{zone.critical_threshold}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">{zone.sensors_count}</td>
                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                level={zone.is_active ? 'safe' : 'neutral'}
                                                label={zone.is_active ? 'Active' : 'Inactive'}
                                                dot
                                            />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('admin.flood-zones.edit', zone.id)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600"
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(zone.id)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {floodZones.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                        No flood zones configured yet. Click "Add Flood Zone" to get started.
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
