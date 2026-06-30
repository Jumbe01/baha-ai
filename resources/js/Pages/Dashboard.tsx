import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import RiskBadge from '@/Components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, AlertTriangle, CloudRain, Droplets, Gauge, Thermometer } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

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
    const { auth } = usePage().props as { auth: { user: { name: string; role: string } } };

    const activeAlerts = stats.riskCounts.warning + stats.riskCounts.critical;

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Welcome back, {auth.user.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    BahaAI Flood Monitoring System - Municipality of Consolacion, Cebu
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSensors}</div>
                        <p className="text-xs text-gray-500">
                            {stats.totalSensors} total deployed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Risk Status</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${activeAlerts > 0 ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activeAlerts > 0 ? activeAlerts : 'Clear'}
                        </div>
                        <div className="flex gap-2 text-xs text-gray-500">
                            <span className="text-red-500">{stats.riskCounts.critical} critical</span>
                            <span className="text-yellow-500">{stats.riskCounts.warning} warning</span>
                            <span className="text-green-500">{stats.riskCounts.safe} safe</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Highest Water Level</CardTitle>
                        <Gauge className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.highestWaterLevel > 0 ? `${stats.highestWaterLevel}m` : '--'}
                        </div>
                        <p className="text-xs text-gray-500">
                            {stats.highestSensor ?? 'No readings'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weather</CardTitle>
                        <CloudRain className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.avgTemperature ? `${stats.avgTemperature}°C` : '--'}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                            {stats.avgHumidity && (
                                <span className="flex items-center gap-1">
                                    <Droplets className="h-3 w-3" /> {stats.avgHumidity}%
                                </span>
                            )}
                            {stats.totalRainfall != null && (
                                <span className="flex items-center gap-1">
                                    <CloudRain className="h-3 w-3" /> {stats.totalRainfall}mm
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Water Level Trend (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentReadings.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={recentReadings}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="time"
                                        tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        fontSize={12}
                                    />
                                    <YAxis fontSize={12} unit="m" />
                                    <Tooltip
                                        labelFormatter={(v) => new Date(v).toLocaleString()}
                                        formatter={(value: number, name: string) => [
                                            `${value.toFixed(2)}${name === 'water_level' ? 'm' : 'mm'}`,
                                            name === 'water_level' ? 'Water Level' : 'Rainfall',
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="water_level"
                                        stroke="#3b82f6"
                                        fill="#93c5fd"
                                        fillOpacity={0.3}
                                        name="water_level"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="rainfall"
                                        stroke="#6366f1"
                                        fill="#a5b4fc"
                                        fillOpacity={0.2}
                                        name="rainfall"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
                                No reading data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Flood Zone Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {floodZones.map((zone) => (
                                <div key={zone.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                                    <div>
                                        <p className="text-sm font-medium">{zone.name}</p>
                                        <p className="text-xs text-gray-500">{zone.barangay} · {zone.sensors_count} sensors</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{zone.water_level}m</span>
                                        <RiskBadge risk={zone.risk} />
                                    </div>
                                </div>
                            ))}
                            {floodZones.length === 0 && (
                                <p className="text-sm text-gray-400">No flood zones configured</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
