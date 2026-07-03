import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import WaterGauge from '@/Components/WaterGauge';
import { cn } from '@/lib/utils';
import { riskToStatus } from '@/lib/status';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CloudRain, Droplets, MapPin, Thermometer } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface SensorDetail {
    id: number;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    flood_zone: string;
    barangay: string;
    water_level: number;
    risk: { level: string; color: string; label: string };
    thresholds: { safe: number; warning: number; critical: number };
}

interface Reading {
    time: string;
    water_level: number;
    rainfall: number;
    temperature: number;
    humidity: number;
}

interface Props {
    sensor: SensorDetail;
    readings: Reading[];
    hours: number;
}

const TIME_RANGES = [
    { label: '6h', value: 6 },
    { label: '24h', value: 24 },
    { label: '48h', value: 48 },
    { label: '7d', value: 168 },
];

export default function Show({ sensor, readings, hours }: Props) {
    const setTimeRange = (h: number) => {
        router.get(route('water-levels.show', sensor.id), { hours: h }, { preserveState: true });
    };

    const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
    const tone = riskToStatus(sensor.risk.level);

    const fmtTick = (v: string) => {
        const d = new Date(v);
        return hours <= 48
            ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${sensor.name} — Water Level`} />

            <PageHeader
                title={sensor.name}
                subtitle={`${sensor.flood_zone} · ${sensor.barangay}`}
                icon={
                    <Link href={route('water-levels.index')} className="mt-1 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                }
                actions={<StatusBadge level={tone} label={sensor.risk.label} />}
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SectionCard>
                    <div className="flex items-center gap-4">
                        <WaterGauge value={sensor.water_level} max={sensor.thresholds.critical * 1.3} warning={sensor.thresholds.warning} critical={sensor.thresholds.critical} />
                        <div>
                            <p className="text-sm text-slate-500">Water Level</p>
                            <p className="font-display text-2xl font-bold text-navy-900">{sensor.water_level.toFixed(2)}m</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3" />{sensor.barangay}</p>
                        </div>
                    </div>
                </SectionCard>
                <StatCard label="Rainfall" value={latestReading?.rainfall.toFixed(1) ?? '--'} unit="mm" icon={CloudRain} tone="info" />
                <StatCard label="Temperature" value={latestReading?.temperature.toFixed(1) ?? '--'} unit="°C" icon={Thermometer} tone="moderate" />
                <StatCard label="Humidity" value={latestReading?.humidity.toFixed(1) ?? '--'} unit="%" icon={Droplets} tone="info" />
            </div>

            <SectionCard
                title="Water Level History"
                className="mt-6"
                action={
                    <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                        {TIME_RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setTimeRange(range.value)}
                                className={cn(
                                    'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                                    hours === range.value ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-white',
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                }
            >
                {readings.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={readings}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                            <XAxis dataKey="time" tickFormatter={fmtTick} fontSize={12} interval="preserveStartEnd" stroke="#94a3b8" />
                            <YAxis fontSize={12} unit="m" stroke="#94a3b8" />
                            <Tooltip
                                labelFormatter={(v) => new Date(v).toLocaleString()}
                                formatter={(value) => [`${Number(value).toFixed(2)}m`, 'Water Level']}
                            />
                            <ReferenceLine y={sensor.thresholds.warning} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Warning', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
                            <ReferenceLine y={sensor.thresholds.critical} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Critical', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                            <Line type="monotone" dataKey="water_level" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-[350px] items-center justify-center text-sm text-slate-400">No readings for this time range</div>
                )}
            </SectionCard>

            <SectionCard title="Rainfall & Environmental Data" className="mt-6">
                {readings.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={readings}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                            <XAxis dataKey="time" tickFormatter={fmtTick} fontSize={12} interval="preserveStartEnd" stroke="#94a3b8" />
                            <YAxis yAxisId="left" fontSize={12} unit="mm" stroke="#94a3b8" />
                            <YAxis yAxisId="right" orientation="right" fontSize={12} unit="°C" stroke="#94a3b8" />
                            <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />
                            <Area yAxisId="left" type="monotone" dataKey="rainfall" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.3} name="Rainfall (mm)" />
                            <Area yAxisId="right" type="monotone" dataKey="temperature" stroke="#f97316" fill="#fdba74" fillOpacity={0.2} name="Temperature (°C)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">No data available</div>
                )}
            </SectionCard>
        </AuthenticatedLayout>
    );
}
