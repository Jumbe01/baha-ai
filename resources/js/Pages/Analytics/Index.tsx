import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AlertSeverityBadge from '@/Components/AlertSeverityBadge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, router } from '@inertiajs/react';
import { Download, Droplets, FileText, TrendingUp, Users } from 'lucide-react';
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
    summary: {
        totalIncidents: number;
        criticalIncidents: number;
        totalAffected: number;
        peakLevel: number;
    };
    byZone: { zone: string; count: number }[];
    filters: { from: string; to: string };
}

export default function Index({ dailyReadings, incidents, summary, byZone, filters }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const applyRange = () => {
        router.get(route('analytics.index'), { from, to }, { preserveState: true });
    };

    const exportData = (format: 'csv' | 'pdf') => {
        window.open(route('analytics.export', { from, to, format }), '_blank');
    };

    return (
        <AuthenticatedLayout header="Analytics">
            <Head title="Analytics" />

            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-end gap-3">
                    <div>
                        <Label htmlFor="from">From</Label>
                        <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="to">To</Label>
                        <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
                    </div>
                    <Button onClick={applyRange}>Apply</Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportData('csv')}>
                        <Download className="mr-2 h-4 w-4" />
                        CSV
                    </Button>
                    <Button variant="outline" onClick={() => exportData('pdf')}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-xs text-gray-400">Total Incidents</p>
                            <p className="text-2xl font-bold">{summary.totalIncidents}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Droplets className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="text-xs text-gray-400">Critical Events</p>
                            <p className="text-2xl font-bold">{summary.criticalIncidents}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Users className="h-8 w-8 text-orange-500" />
                        <div>
                            <p className="text-xs text-gray-400">Affected Residents</p>
                            <p className="text-2xl font-bold">{summary.totalAffected}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Droplets className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="text-xs text-gray-400">Peak Level</p>
                            <p className="text-2xl font-bold">{summary.peakLevel || '--'}m</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Daily Water Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dailyReadings.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={dailyReadings}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" fontSize={11} interval="preserveStartEnd" />
                                    <YAxis fontSize={11} unit="m" />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="avg_water_level" stroke="#3b82f6" name="Avg" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="max_water_level" stroke="#ef4444" name="Max" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">No data in range</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Incidents by Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {byZone.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={byZone} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" fontSize={11} />
                                    <YAxis type="category" dataKey="zone" fontSize={10} width={90} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" name="Incidents" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">No incidents</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Flood Incident History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Zone</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Severity</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Peak</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Rainfall</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Duration</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Affected</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {incidents.map((incident) => (
                                    <tr key={incident.id}>
                                        <td className="px-4 py-2 text-sm text-gray-600">{new Date(incident.occurred_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 text-sm">
                                            {incident.flood_zone?.name}
                                            <span className="block text-xs text-gray-400">{incident.flood_zone?.barangay}</span>
                                        </td>
                                        <td className="px-4 py-2"><AlertSeverityBadge severity={incident.severity} /></td>
                                        <td className="px-4 py-2 text-sm">{incident.peak_water_level}m</td>
                                        <td className="px-4 py-2 text-sm">{incident.total_rainfall}mm</td>
                                        <td className="px-4 py-2 text-sm">{incident.duration_minutes ?? '-'} min</td>
                                        <td className="px-4 py-2 text-sm">{incident.affected_residents}</td>
                                    </tr>
                                ))}
                                {incidents.length === 0 && (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">No incidents in this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
