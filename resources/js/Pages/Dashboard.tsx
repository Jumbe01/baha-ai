import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import WaterGauge from '@/Components/WaterGauge';
import { cn } from '@/lib/utils';
import { riskToStatus, statusStyle } from '@/lib/status';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BrainCircuit,
    Camera,
    CloudRain,
    Droplets,
    Gauge,
    Home,
    Phone,
    Share2,
    Siren,
    Thermometer,
    Wind,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Stats {
    activeSensors: number;
    totalSensors: number;
    riskCounts: { safe: number; warning: number; critical: number; unknown: number };
    highestWaterLevel: number;
    highestSensor: string | null;
    avgTemperature: number | null;
    avgHumidity: number | null;
    totalRainfall: number | null;
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
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const firstName = auth.user.name.split(' ')[0];

    const { critical, warning, safe } = stats.riskCounts;
    const activeAlerts = warning + critical;

    // Overall situation derived from live sensor risk counts.
    const overall = critical > 0 ? 'critical' : warning > 0 ? 'moderate' : 'safe';
    const waterStatusWord = critical > 0 ? 'Critical' : warning > 0 ? 'Moderate' : 'Normal';
    const predictionWord = critical > 0 ? 'High Risk' : warning > 0 ? 'Moderate Risk' : 'Low Risk';
    const rainfall = stats.totalRainfall ?? 0;
    const rainWord = rainfall >= 30 ? 'Heavy Rain' : rainfall >= 7.5 ? 'Moderate Rain' : rainfall > 0 ? 'Light Rain' : 'No Rain';

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <PageHeader
                title={`Welcome back, ${firstName}! 👋`}
                subtitle="Stay informed. Stay safe."
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
                                {activeAlerts} station{activeAlerts === 1 ? '' : 's'} reporting elevated water levels in your area. Possible flooding in low-lying areas.
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
                    tone={overall}
                    status="Next 24 hours"
                    meta="Based on live sensor risk"
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
                        <WaterGauge value={stats.highestWaterLevel} max={4} warning={2.5} critical={3.5} />
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
                    <Link href={route('map.index')} className="relative block h-64 overflow-hidden rounded-xl bg-slate-100">
                        <MiniMap />
                        <div className="absolute right-3 top-3 space-y-1.5 rounded-lg bg-white/90 p-2.5 text-xs shadow">
                            {[
                                ['High Risk', 'bg-red-500'],
                                ['Moderate Risk', 'bg-orange-500'],
                                ['Low Risk', 'bg-amber-400'],
                                ['Safe', 'bg-emerald-500'],
                            ].map(([label, color]) => (
                                <div key={label} className="flex items-center gap-2">
                                    <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
                                    <span className="text-slate-600">{label}</span>
                                </div>
                            ))}
                        </div>
                    </Link>
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
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <WeatherMetric icon={Droplets} label="Humidity" value={stats.avgHumidity != null ? `${stats.avgHumidity}%` : '--'} />
                        <WeatherMetric icon={CloudRain} label="Rain 24h" value={rainfall > 0 ? `${rainfall}mm` : '--'} />
                        <WeatherMetric icon={Thermometer} label="Feels" value={stats.avgTemperature != null ? `${stats.avgTemperature}°` : '--'} />
                    </div>
                </SectionCard>

                <SectionCard title="Quick Actions">
                    <div className="grid grid-cols-2 gap-3">
                        <QuickAction icon={Camera} label="Report Flood" href={route('gps-alerts.index')} tone="info" />
                        <QuickAction icon={Home} label="Evacuation Centers" href={route('evacuation.index')} tone="safe" />
                        <QuickAction icon={Phone} label="Emergency Hotline" href={route('help.index')} tone="critical" />
                        <QuickAction icon={Share2} label="Share Location" href={route('location.select')} tone="moderate" />
                    </div>
                </SectionCard>
            </div>

            <InfoBanner>
                Always stay updated and follow the safety guidelines from your local authorities.
            </InfoBanner>
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

function QuickAction({ icon: Icon, label, href, tone }: { icon: typeof Wind; label: string; href: string; tone: Parameters<typeof statusStyle>[0] }) {
    const s = statusStyle(tone);
    return (
        <Link href={href} className={cn('flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-colors hover:opacity-90', s.softBg)}>
            <Icon className={cn('h-6 w-6', s.icon)} />
            <span className="text-xs font-semibold text-navy-900">{label}</span>
        </Link>
    );
}

/** Stylized mini flood-risk map for the dashboard preview. */
function MiniMap() {
    return (
        <svg viewBox="0 0 400 260" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <rect width="400" height="260" fill="#e8edf2" />
            <rect x="0" y="0" width="140" height="90" fill="#dfeadd" />
            <rect x="280" y="150" width="120" height="110" fill="#dfeadd" />
            <path d="M-10 60 C90 90 130 30 210 80 S360 160 410 130" stroke="#9cc6e8" strokeWidth="26" fill="none" opacity="0.8" />
            <g>
                <circle cx="200" cy="120" r="70" fill="#f59e0b" opacity="0.25" />
                <circle cx="200" cy="120" r="45" fill="#f97316" opacity="0.3" />
                <circle cx="200" cy="120" r="24" fill="#ef4444" opacity="0.35" />
            </g>
            <g stroke="#ffffff" strokeWidth="4" opacity="0.8">
                <line x1="0" y1="180" x2="400" y2="200" />
                <line x1="150" y1="0" x2="210" y2="260" />
            </g>
        </svg>
    );
}
