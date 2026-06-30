import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import RiskBadge from '@/Components/RiskBadge';
import WaterLevelGauge from '@/Components/WaterLevelGauge';
import { Card, CardContent } from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Activity, MapPin } from 'lucide-react';

interface SensorData {
    id: number;
    name: string;
    type: string;
    flood_zone: string;
    barangay: string;
    water_level: number;
    rainfall: number;
    temperature: number | null;
    humidity: number | null;
    last_reading_at: string | null;
    risk: { level: string; color: string; label: string };
    thresholds: { safe: number; warning: number; critical: number };
}

export default function Index({ sensors }: { sensors: SensorData[] }) {
    return (
        <AuthenticatedLayout header="Water Levels">
            <Head title="Water Levels" />

            <div className="mb-6">
                <p className="text-sm text-gray-500">
                    Real-time water level readings from all active sensors
                </p>
            </div>

            {sensors.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                    <Activity className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">No active sensors available</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sensors.map((sensor) => (
                        <Link key={sensor.id} href={route('water-levels.show', sensor.id)} className="block">
                            <Card className="transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-gray-900">{sensor.name}</h3>
                                                <RiskBadge risk={sensor.risk} />
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin className="h-3 w-3" />
                                                {sensor.flood_zone} · {sensor.barangay}
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-400">Rainfall</span>
                                                    <p className="font-medium">{sensor.rainfall}mm</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Type</span>
                                                    <p className="font-medium capitalize">{sensor.type.replace('_', ' ')}</p>
                                                </div>
                                                {sensor.temperature && (
                                                    <div>
                                                        <span className="text-gray-400">Temp</span>
                                                        <p className="font-medium">{sensor.temperature}°C</p>
                                                    </div>
                                                )}
                                                {sensor.humidity && (
                                                    <div>
                                                        <span className="text-gray-400">Humidity</span>
                                                        <p className="font-medium">{sensor.humidity}%</p>
                                                    </div>
                                                )}
                                            </div>
                                            {sensor.last_reading_at && (
                                                <p className="mt-2 text-[10px] text-gray-400">
                                                    Last: {new Date(sensor.last_reading_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <WaterLevelGauge
                                            value={sensor.water_level}
                                            thresholds={sensor.thresholds}
                                            size="sm"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
