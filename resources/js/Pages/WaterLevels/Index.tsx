import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { riskToStatus, statusStyle } from '@/lib/status';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Droplet, Radio, RefreshCw, Siren, Waves } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Sensor {
    id: number;
    name: string;
    type: string;
    flood_zone: string;
    barangay: string;
    water_level: number;
    last_reading_at: string | null;
    risk: { level: string; color: string; label: string };
    thresholds: { safe: number; warning: number; critical: number };
}

export default function WaterLevelsIndex({ sensors }: { sensors: Sensor[] }) {
    const [zone, setZone] = useState('all');

    // Live auto-refresh every 15s.
    useEffect(() => {
        const id = setInterval(() => router.reload({ only: ['sensors'] }), 15000);
        return () => clearInterval(id);
    }, []);

    const zones = useMemo(() => Array.from(new Set(sensors.map((s) => s.flood_zone))).sort(), [sensors]);
    const filtered = zone === 'all' ? sensors : sensors.filter((s) => s.flood_zone === zone);

    const counts = useMemo(() => {
        const c = { normal: 0, warning: 0, critical: 0 };
        sensors.forEach((s) => {
            const lvl = riskToStatus(s.risk.level);
            if (lvl === 'critical') c.critical++;
            else if (lvl === 'warning') c.warning++;
            else c.normal++;
        });
        return c;
    }, [sensors]);

    const total = sensors.length;
    const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

    return (
        <AuthenticatedLayout>
            <Head title="Real-time Monitoring" />

            <PageHeader
                title="Real-time Monitoring"
                subtitle="Live water level data from IoT sensors."
                actions={
                    <>
                        <select
                            value={zone}
                            onChange={(e) => setZone(e.target.value)}
                            className="h-10 rounded-xl border-slate-300 text-sm text-slate-700 focus:border-brand-500 focus:ring-brand-500"
                        >
                            <option value="all">All Stations</option>
                            {zones.map((z) => (
                                <option key={z} value={z}>{z}</option>
                            ))}
                        </select>
                        <span className="flex items-center gap-2 text-xs text-slate-400">
                            <RefreshCw className="h-4 w-4" /> Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Stations" value={total} icon={Radio} tone="info" status={`${total} active`} />
                <StatCard label="Normal" value={counts.normal} icon={Waves} tone="safe" status={`${pct(counts.normal)}%`} />
                <StatCard label="Warning" value={counts.warning} icon={AlertTriangle} tone="warning" status={`${pct(counts.warning)}%`} />
                <StatCard label="Critical" value={counts.critical} icon={Siren} tone="critical" status={`${pct(counts.critical)}%`} />
            </div>

            <SectionCard title="Water Level Stations" className="mt-6" flush>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead>
                            <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3">Station</th>
                                <th className="px-5 py-3">Location</th>
                                <th className="px-5 py-3">Water Level</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Level</th>
                                <th className="px-5 py-3">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => {
                                const level = riskToStatus(s.risk.level);
                                const st = statusStyle(level);
                                const rangeLabel =
                                    s.water_level >= s.thresholds.critical
                                        ? 'Critical Level'
                                        : s.water_level >= s.thresholds.warning
                                          ? 'Warning Level'
                                          : 'Normal Range';
                                const barPct = Math.min((s.water_level / (s.thresholds.critical || 1)) * 100, 100);
                                return (
                                    <tr key={s.id} className={cn('border-b border-l-4 border-slate-100 transition-colors hover:bg-slate-50', st.border)}>
                                        <td className="px-5 py-4">
                                            <Link href={route('water-levels.show', s.id)} className="flex items-center gap-3">
                                                <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', st.softBg)}>
                                                    <Droplet className={cn('h-4 w-4', st.icon)} />
                                                </span>
                                                <span className="font-semibold text-navy-900 hover:text-brand-600">{s.name}</span>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">{s.barangay}</td>
                                        <td className="px-5 py-4">
                                            <span className={cn('font-bold', st.text)}>{s.water_level.toFixed(2)} m</span>
                                            <p className="text-xs text-slate-400">{rangeLabel}</p>
                                        </td>
                                        <td className="px-5 py-4"><StatusBadge level={level} label={s.risk.label} /></td>
                                        <td className="px-5 py-4">
                                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                                <div className={cn('h-full rounded-full', st.icon.replace('text-', 'bg-'))} style={{ width: `${barPct}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-400">
                                            {s.last_reading_at ? new Date(s.last_reading_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No stations found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            <InfoBanner>
                Water level data is collected from IoT sensors in real-time and updated automatically.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
