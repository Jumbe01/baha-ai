import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import { Head } from '@inertiajs/react';
import { CloudRain, Droplets, Gauge, MapPin, RefreshCw, Thermometer, Wind } from 'lucide-react';
import {
    Area,
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface ForecastEntry {
    time: string;
    temperature: number | null;
    rainfall: number;
    condition: string | null;
    icon: string | null;
}

interface Weather {
    location: string;
    temperature: number | null;
    feels_like: number | null;
    humidity: number | null;
    rainfall: number;
    wind_speed: number | null;
    condition: string | null;
    description: string | null;
    icon: string | null;
    forecast: ForecastEntry[];
    fetched_at: string;
}

interface Props {
    weather: Weather;
    usingSimulatedData: boolean;
}

export default function WeatherIndex({ weather, usingSimulatedData }: Props) {
    const forecastData = (weather.forecast ?? []).map((f) => ({
        time: f.time ? new Date(f.time).toLocaleTimeString([], { hour: '2-digit' }) : '',
        temperature: f.temperature,
        rainfall: f.rainfall,
    }));

    const rainWord = weather.rainfall >= 30 ? 'Heavy' : weather.rainfall >= 7.5 ? 'Moderate' : weather.rainfall > 0 ? 'Light' : 'None';
    const humidWord = (weather.humidity ?? 0) >= 80 ? 'High' : (weather.humidity ?? 0) >= 40 ? 'Normal' : 'Low';

    return (
        <AuthenticatedLayout>
            <Head title="Rainfall & Weather" />

            <PageHeader
                title="Rainfall & Weather Monitoring"
                subtitle="Monitor real-time rainfall and weather conditions in your area."
                actions={
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-navy-900">
                            <MapPin className="h-4 w-4 text-brand-600" />
                            {weather.location}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-slate-400">
                            <RefreshCw className="h-4 w-4" />
                            Updated {new Date(weather.fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                }
            />

            {usingSimulatedData && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Simulated weather data (no live API key configured)
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard label="Current Rainfall" value={weather.rainfall} unit="mm" icon={CloudRain} tone="info" status={rainWord} />
                <StatCard label="Temperature" value={weather.temperature ?? '--'} unit="°C" icon={Thermometer} tone="moderate" status={weather.feels_like != null ? `Feels ${weather.feels_like}°` : undefined} />
                <StatCard label="Humidity" value={weather.humidity ?? '--'} unit="%" icon={Droplets} tone={humidWord === 'High' ? 'warning' : 'info'} status={humidWord} />
                <StatCard label="Wind Speed" value={weather.wind_speed ?? '--'} unit="m/s" icon={Wind} tone="neutral" />
                <StatCard label="Condition" value={weather.condition ?? '--'} icon={CloudRain} tone="info" />
                <StatCard label="Feels Like" value={weather.feels_like ?? '--'} unit="°C" icon={Gauge} tone="neutral" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <SectionCard title="Rainfall & Temperature Forecast" className="lg:col-span-2">
                    {forecastData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <ComposedChart data={forecastData} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="rain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                <XAxis dataKey="time" fontSize={11} stroke="#94a3b8" />
                                <YAxis yAxisId="left" fontSize={11} unit="°" width={34} stroke="#94a3b8" />
                                <YAxis yAxisId="right" orientation="right" fontSize={11} unit="mm" width={40} stroke="#94a3b8" />
                                <Tooltip />
                                <Bar yAxisId="right" dataKey="rainfall" fill="#2563eb" name="Rainfall (mm)" radius={[3, 3, 0, 0]} barSize={14} />
                                <Area yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} fill="url(#rain)" name="Temp (°C)" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[320px] items-center justify-center text-sm text-slate-400">No forecast data available</div>
                    )}
                </SectionCard>

                <div className="space-y-6">
                    <SectionCard title="Current Conditions">
                        <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                            <MapPin className="h-4 w-4 text-brand-500" />
                            {weather.location}
                        </p>
                        <div className="flex items-center gap-4">
                            <CloudRain className="h-14 w-14 text-brand-400" />
                            <div>
                                <p className="font-display text-4xl font-bold text-navy-900">{weather.temperature ?? '--'}°</p>
                                <p className="text-sm capitalize text-slate-500">{weather.description ?? weather.condition ?? '—'}</p>
                            </div>
                        </div>
                        <dl className="mt-4 space-y-2 text-sm">
                            <Row label="Feels like" value={weather.feels_like != null ? `${weather.feels_like}°C` : '--'} />
                            <Row label="Humidity" value={weather.humidity != null ? `${weather.humidity}%` : '--'} />
                            <Row label="Wind" value={weather.wind_speed != null ? `${weather.wind_speed} m/s` : '--'} />
                            <Row label="Rainfall" value={`${weather.rainfall} mm`} />
                        </dl>
                    </SectionCard>

                    <SectionCard title="Rainfall Forecast">
                        <div className="space-y-1">
                            {(weather.forecast ?? []).slice(0, 6).map((f, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-slate-50 py-2 text-sm last:border-0">
                                    <span className="flex items-center gap-2 text-slate-500">
                                        <CloudRain className="h-4 w-4 text-brand-400" />
                                        {f.time ? new Date(f.time).toLocaleTimeString([], { hour: '2-digit' }) : '--'}
                                    </span>
                                    <span className="capitalize text-slate-600">{f.condition ?? '—'}</span>
                                    <span className="font-semibold text-navy-900">{f.rainfall} mm</span>
                                </div>
                            ))}
                            {(weather.forecast ?? []).length === 0 && <p className="text-sm text-slate-400">No forecast available.</p>}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <InfoBanner trailing={`Location: ${weather.location}`}>
                Rainfall data is collected from IoT rain gauges and weather sources, updated automatically.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-semibold text-navy-900">{value}</dd>
        </div>
    );
}
