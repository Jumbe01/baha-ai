import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { StatusLevel } from '@/lib/status';
import { Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, Flag, MapPin, Siren } from 'lucide-react';

interface Report {
    id: number;
    barangay: string | null;
    severity: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    status: string;
    created_at: string;
    user: { id: number; name: string } | null;
}

interface Props {
    reports: Paginated<Report>;
    filters: { status?: string };
    counts: { pending: number; reviewed: number; resolved: number };
}

const severityLevel = (s: string): StatusLevel => (s === 'severe' ? 'critical' : s === 'moderate' ? 'warning' : 'moderate');
const statusLevel = (s: string): StatusLevel => (s === 'resolved' ? 'safe' : s === 'reviewed' ? 'info' : 'warning');

const TABS = [
    { key: '', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'resolved', label: 'Resolved' },
];

export default function FloodReportsIndex({ reports, filters, counts }: Props) {
    const applyFilter = (status: string) => {
        router.get(route('flood-reports.index'), status ? { status } : {}, { preserveState: true, replace: true });
    };

    const setStatus = (report: Report, status: string) => {
        router.patch(route('flood-reports.update', report.id), { status }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Flood Reports" />

            <PageHeader
                title="Community Flood Reports"
                subtitle="Review and act on flooding reports submitted by residents."
                icon={<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50"><Flag className="h-6 w-6 text-brand-600" /></span>}
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Pending Review" value={counts.pending} icon={Clock} tone="warning" status="Needs attention" />
                <StatCard label="Reviewed" value={counts.reviewed} icon={Siren} tone="info" />
                <StatCard label="Resolved" value={counts.resolved} icon={CheckCircle2} tone="safe" />
            </div>

            <div className="mb-6 mt-6 flex flex-wrap gap-2">
                {TABS.map((tab) => {
                    const active = (filters.status ?? '') === tab.key;
                    return (
                        <button
                            key={tab.key || 'all'}
                            onClick={() => applyFilter(tab.key)}
                            className={cn(
                                'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                                active ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
                            )}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <SectionCard title="Reports" flush>
                <div className="divide-y divide-slate-100">
                    {reports.data.map((report) => {
                        const sev = severityLevel(report.severity);
                        return (
                            <div key={report.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusBadge level={sev} label={report.severity} />
                                        <StatusBadge level={statusLevel(report.status)} label={report.status} dot />
                                        <span className="text-xs text-slate-400">
                                            {new Date(report.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-700">{report.description}</p>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                        <span>By {report.user?.name ?? 'Unknown'}</span>
                                        {report.barangay && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{report.barangay}</span>}
                                        {report.latitude != null && report.longitude != null && (
                                            <a
                                                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-medium text-brand-600 hover:text-brand-700"
                                            >
                                                View on map →
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    {report.status !== 'reviewed' && report.status !== 'resolved' && (
                                        <button onClick={() => setStatus(report, 'reviewed')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                            Mark reviewed
                                        </button>
                                    )}
                                    {report.status !== 'resolved' && (
                                        <button onClick={() => setStatus(report, 'resolved')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                                            Resolve
                                        </button>
                                    )}
                                    {report.status === 'resolved' && (
                                        <button onClick={() => setStatus(report, 'pending')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                            Reopen
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {reports.data.length === 0 && (
                        <p className="p-10 text-center text-sm text-slate-400">No reports found.</p>
                    )}
                </div>
            </SectionCard>

            {reports.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {reports.links.map((link, i) => (
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

            <InfoBanner>
                Community reports supplement IoT sensor data. Verify on the ground before issuing official advisories.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
