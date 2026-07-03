import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatusBadge from '@/Components/StatusBadge';
import { StatusLevel } from '@/lib/status';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Plus, Pencil, Trash2 } from 'lucide-react';

interface Sensor {
    id: number;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    status: string;
    battery_level: number | null;
    last_reading_at: string | null;
    flood_zone: { id: number; name: string } | null;
    latest_reading: { water_level: number; recorded_at: string } | null;
}

export default function Index({ sensors }: { sensors: Sensor[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this sensor?')) {
            router.delete(route('admin.sensors.destroy', id));
        }
    };

    const statusLevel = (status: string): StatusLevel => {
        if (status === 'active') return 'safe';
        if (status === 'maintenance') return 'warning';
        return 'neutral';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sensors" />

            <PageHeader
                title="Sensors"
                subtitle="Manage IoT sensors deployed across flood zones."
                actions={
                    <Link
                        href={route('admin.sensors.create')}
                        className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Sensor
                    </Link>
                }
            />

            <SectionCard flush>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-sm">
                        <thead>
                            <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Type</th>
                                <th className="px-5 py-3">Flood Zone</th>
                                <th className="px-5 py-3">Latest Reading</th>
                                <th className="px-5 py-3">Battery</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sensors.map((sensor) => (
                                <tr key={sensor.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                                                <Activity className="h-4 w-4 text-brand-500" />
                                            </span>
                                            <span className="font-semibold text-navy-900">{sensor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 capitalize text-slate-500">{sensor.type.replace('_', ' ')}</td>
                                    <td className="px-5 py-4 text-slate-500">{sensor.flood_zone?.name || '-'}</td>
                                    <td className="px-5 py-4 text-slate-500">
                                        {sensor.latest_reading ? `${sensor.latest_reading.water_level}m` : '-'}
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">
                                        {sensor.battery_level ? `${sensor.battery_level}%` : '-'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusBadge level={statusLevel(sensor.status)} label={sensor.status} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={route('admin.sensors.edit', sensor.id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                                aria-label="Edit sensor"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(sensor.id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                                                aria-label="Delete sensor"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sensors.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                        No sensors configured yet. Click "Add Sensor" to get started.
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
