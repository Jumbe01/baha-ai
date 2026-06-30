import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import RiskBadge from '@/Components/RiskBadge';
import WaterLevelGauge from '@/Components/WaterLevelGauge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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

    return (
        <AuthenticatedLayout header={sensor.name}>
            <Head title={`${sensor.name} - Water Level`} />

            <div className="mb-6 flex items-center gap-3">
                <Link href={route('water-levels.index')}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{sensor.name}</h2>
                        <RiskBadge risk={sensor.risk} />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {sensor.flood_zone} · {sensor.barangay}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <WaterLevelGauge value={sensor.water_level} thresholds={sensor.thresholds} size="md" />
                        <div>
                            <p className="text-xs text-gray-400">Water Level</p>
                            <p className="text-2xl font-bold">{sensor.water_level.toFixed(2)}m</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <CloudRain className="h-8 w-8 text-blue-400" />
                        <div>
                            <p className="text-xs text-gray-400">Rainfall</p>
                            <p className="text-2xl font-bold">{latestReading?.rainfall.toFixed(1) ?? '--'}mm</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Thermometer className="h-8 w-8 text-orange-400" />
                        <div>
                            <p className="text-xs text-gray-400">Temperature</p>
                            <p className="text-2xl font-bold">{latestReading?.temperature.toFixed(1) ?? '--'}°C</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Droplets className="h-8 w-8 text-cyan-400" />
                        <div>
                            <p className="text-xs text-gray-400">Humidity</p>
                            <p className="text-2xl font-bold">{latestReading?.humidity.toFixed(1) ?? '--'}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Water Level History</CardTitle>
                    <div className="flex gap-1">
                        {TIME_RANGES.map((range) => (
                            <Button
                                key={range.value}
                                variant={hours === range.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTimeRange(range.value)}
                            >
                                {range.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    {readings.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={readings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    tickFormatter={(v) => {
                                        const d = new Date(v);
                                        return hours <= 48
                                            ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                    }}
                                    fontSize={12}
                                    interval="preserveStartEnd"
                                />
                                <YAxis fontSize={12} unit="m" />
                                <Tooltip
                                    labelFormatter={(v) => new Date(v).toLocaleString()}
                                    formatter={(value: number) => [`${value.toFixed(2)}m`, 'Water Level']}
                                />
                                <ReferenceLine
                                    y={sensor.thresholds.warning}
                                    stroke="#eab308"
                                    strokeDasharray="5 5"
                                    label={{ value: 'Warning', position: 'right', fontSize: 10, fill: '#eab308' }}
                                />
                                <ReferenceLine
                                    y={sensor.thresholds.critical}
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    label={{ value: 'Critical', position: 'right', fontSize: 10, fill: '#ef4444' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="water_level"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[350px] items-center justify-center text-sm text-gray-400">
                            No readings for this time range
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Rainfall & Environmental Data</CardTitle>
                </CardHeader>
                <CardContent>
                    {readings.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={readings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    tickFormatter={(v) => {
                                        const d = new Date(v);
                                        return hours <= 48
                                            ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                    }}
                                    fontSize={12}
                                    interval="preserveStartEnd"
                                />
                                <YAxis yAxisId="left" fontSize={12} unit="mm" />
                                <YAxis yAxisId="right" orientation="right" fontSize={12} unit="°C" />
                                <Tooltip
                                    labelFormatter={(v) => new Date(v).toLocaleString()}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="rainfall"
                                    stroke="#6366f1"
                                    fill="#a5b4fc"
                                    fillOpacity={0.3}
                                    name="Rainfall (mm)"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#f97316"
                                    fill="#fdba74"
                                    fillOpacity={0.2}
                                    name="Temperature (°C)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
