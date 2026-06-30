import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AlertSeverityBadge from '@/Components/AlertSeverityBadge';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Paginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface AlertRow {
    id: number;
    severity: string;
    title: string;
    status: string;
    source: string;
    water_level: number | null;
    created_at: string;
    recipients_count: number;
    flood_zone: { id: number; name: string; barangay: string } | null;
    sensor: { id: number; name: string } | null;
}

interface Props {
    alerts: Paginated<AlertRow>;
    floodZones: { id: number; name: string }[];
    filters: {
        status?: string;
        severity?: string;
        flood_zone_id?: string;
        search?: string;
    };
}

export default function Index({ alerts, floodZones, filters }: Props) {
    const { auth } = usePage().props as { auth: { user: { role: string } } };
    const canManage = auth.user.role === 'admin' || auth.user.role === 'staff';
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) => {
        router.get(
            route('alerts.index'),
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    return (
        <AuthenticatedLayout header="Alerts">
            <Head title="Alerts" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Flood alerts across all monitored zones</p>
                {canManage && (
                    <Link href={route('alerts.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Alert
                        </Button>
                    </Link>
                )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <form onSubmit={submitSearch} className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search alerts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </form>

                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter('status', e.target.value)}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                </select>

                <select
                    value={filters.severity ?? ''}
                    onChange={(e) => applyFilter('severity', e.target.value)}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                    <option value="">All severities</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                </select>

                <select
                    value={filters.flood_zone_id ?? ''}
                    onChange={(e) => applyFilter('flood_zone_id', e.target.value)}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                    <option value="">All zones</option>
                    {floodZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Alert</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Zone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Recipients</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {alerts.data.map((alert) => (
                            <tr
                                key={alert.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => router.visit(route('alerts.show', alert.id))}
                            >
                                <td className="px-6 py-4"><AlertSeverityBadge severity={alert.severity} /></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                                        <span className="text-sm font-medium text-gray-900">{alert.title}</span>
                                    </div>
                                    {alert.source === 'manual' && (
                                        <span className="ml-6 text-[10px] uppercase text-gray-400">Manual</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {alert.flood_zone?.name ?? '-'}
                                    {alert.flood_zone && (
                                        <span className="block text-xs text-gray-400">{alert.flood_zone.barangay}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {alert.water_level != null ? `${alert.water_level}m` : '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{alert.recipients_count}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={alert.status === 'active' ? 'destructive' : 'success'}>
                                        {alert.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">
                                    {new Date(alert.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {alerts.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No alerts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {alerts.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {alerts.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                            className={`rounded px-3 py-1 text-sm ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : link.url
                                      ? 'bg-white text-gray-600 hover:bg-gray-100'
                                      : 'cursor-default text-gray-300'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
