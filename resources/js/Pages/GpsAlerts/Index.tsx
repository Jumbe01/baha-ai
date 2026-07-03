import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EvacuationMap from '@/Components/Map/EvacuationMap';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { riskToStatus, statusStyle } from '@/lib/status';
import { Head } from '@inertiajs/react';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';

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

export default function Index({ center, floodedZones, evacuationCenter }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="GPS Alerts" />

            <PageHeader
                title="GPS Alerts & Evacuation"
                subtitle="Live flood zones and safe evacuation routes near you."
                icon={
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                        <Navigation className="h-5 w-5 text-brand-600" />
                    </span>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <SectionCard flush className="overflow-hidden">
                        <div className="relative h-[calc(100vh-14rem)] overflow-hidden rounded-2xl">
                            <EvacuationMap
                                center={center}
                                floodedZones={floodedZones}
                                evacuationCenter={evacuationCenter}
                            />
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-6">
                    <SectionCard
                        title={`Active Flood Areas (${floodedZones.length})`}
                        icon={<Navigation className="h-5 w-5 text-brand-500" />}
                    >
                        <div className="space-y-3">
                            {floodedZones.map((zone) => {
                                const level = riskToStatus(zone.risk);
                                return (
                                    <div
                                        key={zone.id}
                                        className={cn(
                                            'rounded-xl border border-slate-100 border-l-4 p-3',
                                            statusStyle(level).border,
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-navy-900">{zone.name}</span>
                                            <StatusBadge level={level} label={zone.risk} />
                                        </div>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                            <MapPin className="h-3 w-3" />
                                            {zone.barangay} · {zone.water_level}m
                                        </div>
                                    </div>
                                );
                            })}
                            {floodedZones.length === 0 && (
                                <div className="py-8 text-center">
                                    <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" />
                                    <p className="mt-2 text-sm text-slate-400">
                                        No active flood areas. All zones are currently safe.
                                    </p>
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                <MapPin className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-400">Evacuation Center</p>
                                <p className="text-sm font-semibold text-navy-900">{evacuationCenter.name}</p>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>

            <InfoBanner>
                Evacuation routes are generated from real-time flood data. Follow the highlighted path to the nearest
                evacuation center and heed instructions from local authorities.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
