import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { riskToStatus } from '@/lib/status';
import { Head, router } from '@inertiajs/react';
import { Droplets, FileDown, FileText, Siren, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface DailyReading {
    day: string;
    avg_water_level: number;
    max_water_level: number;
    avg_rainfall: number;
}

interface Incident {
    id: number;
    severity: string;
    peak_water_level: number;
    total_rainfall: number;
    duration_minutes: number | null;
    affected_residents: number;
    occurred_at: string;
    flood_zone: { id: number; name: string; barangay: string } | null;
}

interface Props {
    dailyReadings: DailyReading[];
    incidents: Incident[];
    summary: { totalIncidents: number; criticalIncidents: number; totalAffected: number; peakLevel: number };
    byZone: { zone: string; count: number }[];
    filters: { from: string; to: string };
}

export default function AnalyticsIndex({ dailyReadings, incidents, summary, byZone, filters }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const applyRange = () => router.get(route('analytics.index'), { from, to }, { preserveState: true });
    const exportData = (format: 'csv' | 'pdf') => window.open(route('analytics.export', { from, to, format }), '_blank');

    return (
        <AuthenticatedLayout>
            <Head title="Reports & Analytics" />

            <PageHeader
                title="Reports & Analytics"
                subtitle="Explore flood, rainfall, and water level data with advanced analytics."
                actions={
                    <>
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500" />
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500" />
                        <button onClick={applyRange} className="h-10 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Apply</button>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Incidents" value={summary.totalIncidents} icon={TrendingUp} tone="info" />
                <StatCard label="Critical Events" value={summary.criticalIncidents} icon={Siren} tone="critical" />
                <StatCard label="Affected Residents" value={summary.totalAffected} icon={Users} tone="warning" />
                <StatCard label="Peak Level" value={summary.peakLevel || '--'} unit="m" icon={Droplets} tone="info" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <SectionCard title="Daily Water Level" className="lg:col-span-2">
                    {dailyReadings.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyReadings}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                <XAxis dataKey="day" fontSize={11} interval="preserveStartEnd" stroke="#94a3b8" />
                                <YAxis fontSize={11} unit="m" stroke="#94a3b8" />
                                <Tooltip />
                                <Line type="monotone" dataKey="avg_water_level" stroke="#2563eb" name="Avg" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="max_water_level" stroke="#ef4444" name="Max" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No data in range</div>
                    )}
                </SectionCard>

                <SectionCard title="Incidents by Zone">
                    {byZone.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={byZone} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                                <YAxis type="category" dataKey="zone" fontSize={10} width={90} stroke="#94a3b8" />
                                <Tooltip />
                                <Bar dataKey="count" fill="#2563eb" name="Incidents" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No incidents</div>
                    )}
                </SectionCard>
            </div>

            <SectionCard title="Flood Incident History" className="mt-6" flush>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Zone</th>
                                <th className="px-5 py-3">Severity</th>
                                <th className="px-5 py-3">Peak</th>
                                <th className="px-5 py-3">Rainfall</th>
                                <th className="px-5 py-3">Duration</th>
                                <th className="px-5 py-3">Affected</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.map((incident) => (
                                <tr key={incident.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-5 py-3 text-slate-600">{new Date(incident.occurred_at).toLocaleDateString()}</td>
                                    <td className="px-5 py-3">
                                        <span className="font-medium text-navy-900">{incident.flood_zone?.name}</span>
                                        <span className="block text-xs text-slate-400">{incident.flood_zone?.barangay}</span>
                                    </td>
                                    <td className="px-5 py-3"><StatusBadge level={riskToStatus(incident.severity)} label={incident.severity} /></td>
                                    <td className="px-5 py-3 text-slate-600">{incident.peak_water_level}m</td>
                                    <td className="px-5 py-3 text-slate-600">{incident.total_rainfall}mm</td>
                                    <td className="px-5 py-3 text-slate-600">{incident.duration_minutes ?? '-'} min</td>
                                    <td className="px-5 py-3 text-slate-600">{incident.affected_residents}</td>
                                </tr>
                            ))}
                            {incidents.length === 0 && (
                                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">No incidents in this period.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            <SectionCard title="Data Export" className="mt-6">
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => exportData('csv')} className={cn('flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50')}>
                        <FileDown className="h-4 w-4 text-emerald-600" /> Export CSV
                    </button>
                    <button onClick={() => exportData('pdf')} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <FileText className="h-4 w-4 text-red-500" /> Generate PDF Report
                    </button>
                </div>
            </SectionCard>

            <InfoBanner>
                Data is collected from IoT sensors, weather stations, and partner agencies. All times are in Philippine Standard Time (PST).
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
