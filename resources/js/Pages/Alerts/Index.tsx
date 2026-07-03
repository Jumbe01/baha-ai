import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { StatusLevel } from '@/lib/status';
import { Paginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Bell, CheckCircle2, Info, Mail, MessageSquare, Plus, Search, Settings, Smartphone } from 'lucide-react';
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
    filters: { status?: string; severity?: string; flood_zone_id?: string; search?: string };
}

const severityLevel = (s: string): StatusLevel =>
    s === 'critical' ? 'critical' : s === 'warning' ? 'warning' : 'info';

const TABS = [
    { key: 'all', label: 'All', filter: {} },
    { key: 'active', label: 'Active', filter: { status: 'active' } },
    { key: 'resolved', label: 'Resolved', filter: { status: 'resolved' } },
    { key: 'critical', label: 'Critical', filter: { severity: 'critical' } },
    { key: 'warning', label: 'Warning', filter: { severity: 'warning' } },
];

export default function AlertsIndex({ alerts, floodZones, filters }: Props) {
    const { auth } = usePage().props as { auth: { user: { role: string } } };
    const canManage = auth.user.role === 'admin' || auth.user.role === 'staff';
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (patch: Record<string, string | undefined>) => {
        router.get(route('alerts.index'), { ...filters, ...patch }, { preserveState: true, replace: true });
    };

    const activeTab = filters.severity
        ? filters.severity
        : filters.status ?? 'all';

    return (
        <AuthenticatedLayout>
            <Head title="Alerts & Notifications" />

            <PageHeader
                title="Alerts & Notifications"
                subtitle="Stay informed. Stay prepared."
                actions={
                    <>
                        {canManage && (
                            <Link href={route('alerts.create')} className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
                                <Plus className="h-4 w-4" /> Create Alert
                            </Link>
                        )}
                        <Link href={route('profile.edit')} className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <Settings className="h-4 w-4" /> Alert Settings
                        </Link>
                    </>
                }
            />

            {/* Filter tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => applyFilter({ status: undefined, severity: undefined, ...tab.filter })}
                        className={cn(
                            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                            activeTab === tab.key || (tab.key === 'all' && activeTab === 'all')
                                ? 'bg-brand-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-50',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <SectionCard
                    title="Alert History"
                    className="lg:col-span-2"
                    action={
                        <form
                            onSubmit={(e) => { e.preventDefault(); applyFilter({ search: search || undefined }); }}
                            className="relative"
                        >
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search alerts…"
                                className="h-9 w-48 rounded-lg border-slate-300 pl-9 text-sm focus:border-brand-500 focus:ring-brand-500"
                            />
                        </form>
                    }
                >
                    <div className="space-y-3">
                        {alerts.data.map((alert) => {
                            const level = severityLevel(alert.severity);
                            const Icon = alert.status === 'resolved' ? CheckCircle2 : alert.severity === 'info' ? Info : AlertTriangle;
                            const iconTone = alert.status === 'resolved' ? 'safe' : level;
                            return (
                                <Link
                                    key={alert.id}
                                    href={route('alerts.show', alert.id)}
                                    className={cn('flex items-start gap-4 rounded-xl border border-slate-100 border-l-4 p-4 transition-colors hover:bg-slate-50',
                                        iconTone === 'critical' ? 'border-l-red-500' : iconTone === 'warning' ? 'border-l-orange-500' : iconTone === 'safe' ? 'border-l-emerald-500' : 'border-l-brand-500')}
                                >
                                    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                                        iconTone === 'critical' ? 'bg-red-500' : iconTone === 'warning' ? 'bg-orange-500' : iconTone === 'safe' ? 'bg-emerald-500' : 'bg-brand-500')}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-navy-900">{alert.title}</p>
                                            <StatusBadge level={level} label={alert.severity} />
                                            {alert.status === 'resolved' && <StatusBadge level="safe" label="resolved" />}
                                        </div>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            {alert.flood_zone ? `${alert.flood_zone.name}, ${alert.flood_zone.barangay}` : 'System-wide'}
                                            {alert.water_level != null && ` · ${alert.water_level}m`}
                                            {` · ${alert.recipients_count} recipients`}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-slate-400">{new Date(alert.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </Link>
                            );
                        })}
                        {alerts.data.length === 0 && (
                            <p className="py-10 text-center text-sm text-slate-400">No alerts found.</p>
                        )}
                    </div>

                    {alerts.last_page > 1 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {alerts.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    className={cn('rounded-lg px-3 py-1 text-sm',
                                        link.active ? 'bg-brand-600 text-white' : link.url ? 'bg-white text-slate-600 hover:bg-slate-100' : 'cursor-default text-slate-300')}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </SectionCard>

                <div className="space-y-6">
                    <SectionCard title="Filter by Zone">
                        <select
                            value={filters.flood_zone_id ?? ''}
                            onChange={(e) => applyFilter({ flood_zone_id: e.target.value || undefined })}
                            className="h-10 w-full rounded-xl border-slate-300 text-sm text-slate-700 focus:border-brand-500 focus:ring-brand-500"
                        >
                            <option value="">All zones</option>
                            {floodZones.map((z) => (
                                <option key={z.id} value={z.id}>{z.name}</option>
                            ))}
                        </select>
                    </SectionCard>

                    <SectionCard title="Alert Channels">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Bell, label: 'In-App' },
                                { icon: MessageSquare, label: 'SMS' },
                                { icon: Smartphone, label: 'Push' },
                                { icon: Mail, label: 'Email' },
                            ].map((c) => (
                                <div key={c.label} className="rounded-xl border border-slate-200 p-3 text-center">
                                    <c.icon className="mx-auto h-5 w-5 text-brand-500" />
                                    <p className="mt-1 text-sm font-semibold text-navy-900">{c.label}</p>
                                    <p className="text-xs text-emerald-600">Enabled</p>
                                </div>
                            ))}
                        </div>
                        <Link href={route('profile.edit')} className="mt-4 block text-center text-sm font-semibold text-brand-600 hover:text-brand-700">
                            Manage alert settings →
                        </Link>
                    </SectionCard>
                </div>
            </div>

            <InfoBanner>
                Alerts are based on real-time data from IoT sensors, weather updates, and AI predictions. Always follow the safety guidelines from your local authorities.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
