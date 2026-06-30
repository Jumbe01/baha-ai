import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EvacuationMap from '@/Components/Map/EvacuationMap';
import RiskBadge from '@/Components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head } from '@inertiajs/react';
import { MapPin, Navigation } from 'lucide-react';

interface FloodedZone {
    id: number;
    name: string;
    barangay: string;
    risk: string;
    water_level: number;
    center: { lat: number; lng: number };
    evacuation_route: { lat: number; lng: number }[];
}

interface Props {
    center: { lat: number; lng: number };
    floodedZones: FloodedZone[];
    evacuationCenter: { lat: number; lng: number; name: string };
}

const riskMap: Record<string, { level: string; label: string }> = {
    warning: { level: 'warning', label: 'Warning' },
    critical: { level: 'critical', label: 'Critical' },
};

export default function Index({ center, floodedZones, evacuationCenter }: Props) {
    return (
        <AuthenticatedLayout header="GPS Alerts & Evacuation">
            <Head title="GPS Alerts" />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="relative h-[calc(100vh-12rem)] overflow-hidden rounded-lg border border-gray-200">
                        <EvacuationMap
                            center={center}
                            floodedZones={floodedZones}
                            evacuationCenter={evacuationCenter}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Navigation className="h-4 w-4" />
                                Active Flood Areas ({floodedZones.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {floodedZones.map((zone) => (
                                    <div key={zone.id} className="rounded-lg border border-gray-100 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{zone.name}</span>
                                            <RiskBadge risk={riskMap[zone.risk] ?? riskMap.warning} />
                                        </div>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="h-3 w-3" />
                                            {zone.barangay} · {zone.water_level}m
                                        </div>
                                    </div>
                                ))}
                                {floodedZones.length === 0 && (
                                    <p className="text-sm text-gray-400">
                                        No active flood areas. All zones are currently safe.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded bg-green-100 p-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Evacuation Center</p>
                                <p className="text-sm font-semibold">{evacuationCenter.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
