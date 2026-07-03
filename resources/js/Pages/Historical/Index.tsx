import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import { Head, router } from '@inertiajs/react';
import { CloudRain, Droplets, Siren, Sun, TrendingUp, Waves } from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Daily {
    day: string;
    avg_water_level: number;
    max_water_level: number;
    total_rainfall: number;
}

interface Props {
    daily: Daily[];
    summary: {
        avgWaterLevel: number;
        totalRainfall: number;
        maxWaterLevel: number;
        rainyDays: number;
        dryDays: number;
        floodEvents: number;
    };
    filters: { from: string; to: string };
}

export default function HistoricalIndex({ daily, summary, filters }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const applyRange = () => router.get(route('historical.index'), { from, to }, { preserveState: true });

    return (
        <AuthenticatedLayout>
            <Head title="Historical Data" />

            <PageHeader
                title="Historical Data & Analytics"
                subtitle="Explore historical flood, rainfall, and water level data with advanced analytics."
                actions={
                    <>
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500" />
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500" />
                        <button onClick={applyRange} className="h-10 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Apply</button>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <StatCard label="Average Water Level" value={summary.avgWaterLevel || '--'} unit="m" icon={Droplets} tone="info" />
                <StatCard label="Total Rainfall" value={summary.totalRainfall || '--'} unit="mm" icon={CloudRain} tone="info" />
                <StatCard label="Flood Events" value={summary.floodEvents} icon={Siren} tone="critical" />
                <StatCard label="Max Water Level" value={summary.maxWaterLevel || '--'} unit="m" icon={Waves} tone="warning" />
                <StatCard label="Rainy / Dry Days" value={`${summary.rainyDays} / ${summary.dryDays}`} icon={Sun} tone="moderate" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <SectionCard title="Water Level Trends" icon={<TrendingUp className="h-5 w-5 text-brand-600" />}>
                    {daily.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={daily}>
                                <defs>
                                    <linearGradient id="hwl" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                <XAxis dataKey="day" fontSize={11} interval="preserveStartEnd" stroke="#94a3b8" />
                                <YAxis fontSize={11} unit="m" stroke="#94a3b8" />
                                <Tooltip />
                                <Area type="monotone" dataKey="max_water_level" stroke="#2563eb" strokeWidth={2} fill="url(#hwl)" name="Max (m)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No data in range</div>
                    )}
                </SectionCard>

                <SectionCard title="Rainfall Trends" icon={<CloudRain className="h-5 w-5 text-brand-600" />}>
                    {daily.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={daily}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                <XAxis dataKey="day" fontSize={11} interval="preserveStartEnd" stroke="#94a3b8" />
                                <YAxis fontSize={11} unit="mm" stroke="#94a3b8" />
                                <Tooltip />
                                <Bar dataKey="total_rainfall" fill="#2563eb" name="Rainfall (mm)" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No data in range</div>
                    )}
                </SectionCard>
            </div>

            <InfoBanner>
                Historical data is updated every 15 minutes. All times are in Philippine Standard Time (PST).
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
