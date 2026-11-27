import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import WaterGauge from '@/Components/WaterGauge';
import { cn } from '@/lib/utils';
import { riskToStatus, statusStyle } from '@/lib/status';
import ReportFloodModal from '@/Components/ReportFloodModal';
import FloodMap from '@/Components/Map/FloodMap';
import { useNow, useOnline } from '@/hooks/useBrowserState';
import { Head, Link, router, usePage, usePoll } from '@inertiajs/react';
import { useState } from 'react';
import {
    AlertTriangle,
    BrainCircuit,
    Flag,
    CloudLightning,
    CloudRain,
    Droplets,
    Home,
    Phone,
    Share2,
    Siren,
    Wind,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const POLL_MS = 15000;

// Same centre the full Flood Map page gets from MapController.
const MAP_CENTER = { lat: 10.3667, lng: 123.9567 };

// The three tiers the map actually colours.
const RISK_LEGEND = [
    ['critical', 'Critical'],
    ['warning', 'Warning'],
    ['safe', 'Safe'],
] as const;

interface Stats {
    activeSensors: number;
    totalSensors: number;
    riskCounts: { safe: number; warning: number; critical: number; unknown: number };
    highestWaterLevel: number;
    highestSensor: string | null;
    avgTemperature: number | null;
    avgHumidity: number | null;
    totalRainfall: number | null;
    activeAlerts: number;
    predictionRisk: 'safe' | 'warning' | 'critical' | null;
    highestWarning: number | null;
    highestCritical: number | null;
}

interface FloodZoneStatus {
    id: number;
    name: string;
    barangay: string;
    sensors_count: number;
    water_level: number;
    risk: { level: string; color: string; label: string };
}

interface Reading {
    time: string;
    water_level: number;
    rainfall: number;
}

interface Props {
    stats: Stats;
    floodZones: FloodZoneStatus[];
    recentReadings: Reading[];
}

export default function Dashboard({ stats, floodZones, recentReadings }: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string; role: string } } };
    const firstName = auth.user.name.split(' ')[0];
    const isStaff = auth.user.role === 'admin' || auth.user.role === 'staff';
    const [reportOpen, setReportOpen] = useState(false);
    const [simulating, setSimulating] = useState(false);

    const simulate = (name: 'simulation.storm' | 'simulation.calm') =>
        router.post(route(name), {}, {
            preserveScroll: true,
            onStart: () => setSimulating(true),
            onFinish: () => setSimulating(false),
        });

    // Live auto-refresh every 15s without a full page reload; usePoll throttles
    // itself while the tab is hidden.
    const [lastRefresh, setLastRefresh] = useState(() => new Date());
    usePoll(POLL_MS, {
        only: ['stats', 'floodZones', 'recentReadings', 'unreadNotifications'],
        onSuccess: () => setLastRefresh(new Date()),
    });

    const { critical, warning, safe } = stats.riskCounts;
    const stationsAtRisk = warning + critical;
    const activeAlerts = stats.activeAlerts;

    // Overall situation derived from live sensor risk counts.
    const overall = critical > 0 ? 'critical' : warning > 0 ? 'moderate' : 'safe';
    const waterStatusWord = critical > 0 ? 'Critical' : warning > 0 ? 'Moderate' : 'Normal';
    // From the regression forecast when one is fresh; otherwise fall back to live sensor risk.
    const forecast = stats.predictionRisk ?? (critical > 0 ? 'critical' : warning > 0 ? 'warning' : 'safe');
    const predictionWord = forecast === 'critical' ? 'High Risk' : forecast === 'warning' ? 'Moderate Risk' : 'Low Risk';
    const predictionTone = forecast === 'critical' ? 'critical' : forecast === 'warning' ? 'moderate' : 'safe';
    const gaugeWarning = stats.highestWarning ?? 1.5;
    const gaugeCritical = stats.highestCritical ?? 3.0;
    const gaugeMax = Math.max(gaugeCritical + 1, stats.highestWaterLevel);
    const rainfall = stats.totalRainfall ?? 0;
    const rainWord = rainfall >= 30 ? 'Heavy Rain' : rainfall >= 7.5 ? 'Moderate Rain' : rainfall > 0 ? 'Light Rain' : 'No Rain';

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <PageHeader
                title={`Welcome back, ${firstName}! 👋`}
                subtitle="Stay informed. Stay safe."
                actions={
                    <div className="flex flex-wrap items-center gap-3">
                        {isStaff && (
                            <>
                                <button
                                    onClick={() => simulate('simulation.storm')}
                                    disabled={simulating}
                                    className="flex h-9 items-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                                >
                                    <CloudLightning className="h-4 w-4" /> {simulating ? 'Simulating…' : 'Simulate Storm'}
                                </button>
                                <button
                                    onClick={() => simulate('simulation.calm')}
                                    disabled={simulating}
                                    className="flex h-9 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                                >
                                    Reset
                                </button>
                            </>
                        )}
                        <LivePill lastRefresh={lastRefresh} />
                    </div>
                }
            />

            {/* Situation banner */}
            {overall !== 'safe' ? (
                <div className={cn(
                    'mb-6 flex flex-col gap-3 rounded-2xl border-l-4 p-4 sm:flex-row sm:items-center sm:justify-between',
                    overall === 'critical' ? 'border-l-red-500 bg-red-50' : 'border-l-orange-500 bg-orange-50',
                )}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className={cn('mt-0.5 h-6 w-6 shrink-0', overall === 'critical' ? 'text-red-500' : 'text-orange-500')} />
                        <div>
                            <p className={cn('font-bold', overall === 'critical' ? 'text-red-600' : 'text-orange-600')}>
                                {overall === 'critical' ? 'FLOOD WARNING' : 'ADVISORY'}
                            </p>
                            <p className="text-sm text-slate-600">
                                {stationsAtRisk} station{stationsAtRisk === 1 ? '' : 's'} reporting elevated water levels in your area. Possible flooding in low-lying areas.
                            </p>
                        </div>
                    </div>
                    <Link href={route('alerts.index')} className="shrink-0 rounded-lg border border-current bg-white px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50">
                        View Details
                    </Link>
                </div>
            ) : (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border-l-4 border-l-emerald-500 bg-emerald-50 p-4">
                    <AlertTriangle className="h-6 w-6 shrink-0 text-emerald-500" />
                    <p className="text-sm text-slate-600">
                        <span className="font-bold text-emerald-600">ALL CLEAR</span> — all monitored stations are within normal levels.
                    </p>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Water Level Status"
                    value={stats.highestWaterLevel > 0 ? stats.highestWaterLevel.toFixed(2) : '--'}
                    unit="m"
                    icon={Droplets}
                    tone={overall}
                    status={waterStatusWord}
                    meta={stats.highestSensor ?? 'No readings'}
                />
                <StatCard
                    label="AI Flood Prediction"
                    value={predictionWord}
                    icon={BrainCircuit}
                    tone={predictionTone}
                    status="Next 60 minutes"
                    meta={stats.predictionRisk ? 'From latest regression forecast' : 'Based on live sensor risk'}
                />
                <StatCard
                    label="Rainfall (24h avg)"
                    value={rainfall > 0 ? rainfall.toFixed(1) : '--'}
                    unit="mm"
                    icon={CloudRain}
                    tone="info"
                    status={rainWord}
                    meta="Across active sensors"
                />
                <StatCard
                    label="Active Alerts"
                    value={activeAlerts}
                    icon={Siren}
                    tone={activeAlerts > 0 ? 'critical' : 'safe'}
                    status={activeAlerts > 0 ? 'Active' : 'None'}
                    meta={`${stats.activeSensors}/${stats.totalSensors} sensors online`}
                />
            </div>

            {/* Water level + map */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <SectionCard
                    title="Real-time Water Level"
                    action={
                        <Link href={route('water-levels.index')} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                            View All Stations →
                        </Link>
                    }
                >
                    <p className="mb-4 text-sm font-medium text-slate-500">{stats.highestSensor ?? 'No active station'}</p>
                    <div className="flex items-center gap-6">
                        <WaterGauge value={stats.highestWaterLevel} max={gaugeMax} warning={gaugeWarning} critical={gaugeCritical} />
                        <div className="flex-1">
                            <p className="font-display text-3xl font-bold text-navy-900">
                                {stats.highestWaterLevel.toFixed(2)}<span className="ml-1 text-lg text-slate-500">m</span>
                            </p>
                            <p className={cn('text-sm font-semibold', statusStyle(overall).text)}>{waterStatusWord}</p>
                            <div className="mt-3 h-24">
                                {recentReadings.length > 1 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={recentReadings} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                                            <defs>
                                                <linearGradient id="wl" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="time" hide />
                                            <YAxis hide domain={['dataMin - 0.2', 'dataMax + 0.2']} />
                                            <Tooltip
                                                formatter={(value) => [`${Number(value).toFixed(2)} m`, 'Water level']}
                                                labelFormatter={() => ''}
                                            />
                                            <Area type="monotone" dataKey="water_level" stroke="#2563eb" strokeWidth={2} fill="url(#wl)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">No trend data</div>
                                )}
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    title="Flood Risk Map"
                    action={
                        <Link href={route('map.index')} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                            View Full Map →
                        </Link>
                    }
                    flush
                    bodyClassName="p-5 pt-4"
                >
                    <div className="relative h-64 overflow-hidden rounded-xl bg-slate-100">
                        {/* FloodMap fetches its GeoJSON once on mount; keying on the zone risk
                            levels remounts it only when a polled risk actually changes. */}
                        <FloodMap
                            key={floodZones.map((z) => `${z.id}:${z.risk.level}`).join(',')}
                            center={MAP_CENTER}
                            geojsonUrl="/api/map/geojson"
                            sensorsUrl="/api/map/sensors"
                        />
                        <div className="pointer-events-none absolute bottom-3 left-3 z-10 space-y-1.5 rounded-lg bg-white/90 p-2.5 text-xs shadow">
                            {RISK_LEGEND.map(([level, label]) => (
                                <div key={level} className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusStyle(level).hex }} />
                                    <span className="text-slate-600">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Bottom row */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <SectionCard
                    title="Flood Zone Status"
                    action={
                        <Link href={route('water-levels.index')} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                            View All →
                        </Link>
                    }
                >
                    <div className="space-y-2.5">
                        {floodZones.map((zone) => {
                            const level = riskToStatus(zone.risk.level);
                            return (
                                <div key={zone.id} className={cn('flex items-center justify-between rounded-xl border border-slate-100 border-l-4 p-3', statusStyle(level).border)}>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-navy-900">{zone.name}</p>
                                        <p className="truncate text-xs text-slate-500">{zone.barangay} · {zone.sensors_count} sensors</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="text-sm font-bold text-navy-900">{zone.water_level}m</span>
                                        <StatusBadge level={level} label={zone.risk.label} />
                                    </div>
                                </div>
                            );
                        })}
                        {floodZones.length === 0 && <p className="text-sm text-slate-400">No flood zones configured.</p>}
                    </div>
                </SectionCard>

                <SectionCard
                    title="Weather Overview"
                    action={
                        <Link href={route('weather.index')} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                            View Details →
                        </Link>
                    }
                >
                    <div className="flex items-center gap-4">
                        <CloudRain className="h-14 w-14 text-brand-400" />
                        <div>
                            <p className="font-display text-4xl font-bold text-navy-900">
                                {stats.avgTemperature != null ? `${stats.avgTemperature}°` : '--'}
                            </p>
                            <p className="text-sm text-slate-500">{rainWord}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                        <WeatherMetric icon={Droplets} label="Humidity" value={stats.avgHumidity != null ? `${stats.avgHumidity}%` : '--'} />
                        <WeatherMetric icon={CloudRain} label="Rain 24h" value={rainfall > 0 ? `${rainfall}mm` : '--'} />
                    </div>
                </SectionCard>

                <SectionCard title="Quick Actions">
                    <div className="grid grid-cols-2 gap-3">
                        <QuickAction icon={Flag} label="Report Flood" onClick={() => setReportOpen(true)} tone="info" />
                        <QuickAction icon={Home} label="Evacuation Centers" href={route('evacuation.index')} tone="safe" />
                        <QuickAction icon={Phone} label="Emergency Hotline" href={route('help.index')} tone="critical" />
                        <QuickAction icon={Share2} label="Share Location" href={route('location.select')} tone="moderate" />
                    </div>
                </SectionCard>
            </div>

            <InfoBanner>
                Always stay updated and follow the safety guidelines from your local authorities.
            </InfoBanner>

            <ReportFloodModal show={reportOpen} onClose={() => setReportOpen(false)} />
        </AuthenticatedLayout>
    );
}

function WeatherMetric({ icon: Icon, label, value }: { icon: typeof Wind; label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3">
            <Icon className="mx-auto h-4 w-4 text-slate-400" />
            <p className="mt-1 text-sm font-bold text-navy-900">{value}</p>
            <p className="text-[11px] text-slate-500">{label}</p>
        </div>
    );
}

function QuickAction({ icon: Icon, label, href, onClick, tone }: { icon: typeof Wind; label: string; href?: string; onClick?: () => void; tone: Parameters<typeof statusStyle>[0] }) {
    const s = statusStyle(tone);
    const className = cn('flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-colors hover:opacity-90', s.softBg);
    const content = (
        <>
            <Icon className={cn('h-6 w-6', s.icon)} />
            <span className="text-xs font-semibold text-navy-900">{label}</span>
        </>
    );
    if (onClick) {
        return <button type="button" onClick={onClick} className={className}>{content}</button>;
    }
    return <Link href={href!} className={className}>{content}</Link>;
}

/**
 * Shows the time of the last successful poll. Pulses only while refreshes are
 * landing; "Stale" after two missed intervals, "Offline" when the browser has no network.
 */
function LivePill({ lastRefresh }: { lastRefresh: Date }) {
    const now = useNow(1000);
    const online = useOnline();
    const stale = now.getTime() - lastRefresh.getTime() > POLL_MS * 2;
    const state = !online ? 'offline' : stale ? 'stale' : 'live';
    const tone = {
        live: { pill: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500', label: 'Live' },
        stale: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'Stale' },
        offline: { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', label: 'Offline' },
    }[state];

    return (
        <span
            className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold', tone.pill)}
            title="Time of the last successful data refresh"
        >
            <span className="relative flex h-2 w-2">
                {state === 'live' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={cn('relative inline-flex h-2 w-2 rounded-full', tone.dot)} />
            </span>
            {tone.label} · {lastRefresh.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
    );
}
