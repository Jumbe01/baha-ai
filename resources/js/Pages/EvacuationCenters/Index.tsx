import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import SheltersMap, { type ShelterPoint } from '@/Components/Map/SheltersMap';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { Home, MapPin, Navigation, Phone, ShieldCheck, Users } from 'lucide-react';

const HOTLINES = [
    { label: 'National Emergency Hotline', number: '911' },
    { label: 'NDRRMC Operations Center', number: '(02) 8911-1406' },
    { label: 'Philippine Red Cross', number: '143' },
];

const CHECKLIST = [
    'Prepare a go-bag with water, food, medicine, and important documents.',
    'Know the fastest route to your nearest evacuation center.',
    'Keep phones charged and monitor official BahaAI alerts.',
    'Follow instructions from local disaster response officers.',
];

interface Center extends ShelterPoint {
    address: string | null;
    contact_number: string | null;
    occupancy_percent: number;
    current_occupancy: number;
    flood_zone?: { id: number; name: string } | null;
}

interface Props {
    centers: Center[];
    userLocation: { lat: number; lng: number } | null;
    userBarangay: string | null;
}

const STATUS_STYLE: Record<string, string> = {
    open: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    full: 'bg-orange-50 text-orange-700 ring-orange-200',
    closed: 'bg-red-50 text-red-700 ring-red-200',
};

export default function EvacuationCentersIndex({ centers, userLocation, userBarangay }: Props) {
    const nearest = centers[0];

    return (
        <AuthenticatedLayout>
            <Head title="Evacuation Centers" />

            <PageHeader
                title="Evacuation Centers"
                subtitle={
                    userLocation
                        ? 'Centers near you, closest first.'
                        : 'Designated evacuation centers across Consolacion.'
                }
                icon={<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50"><Home className="h-6 w-6 text-brand-600" /></span>}
            />

            {!userLocation && (
                <InfoBanner>
                    Set your location under <b>Profile &amp; Settings → Update Location</b> to see which center is
                    closest to you and how far away it is.
                </InfoBanner>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <SectionCard title="Evacuation Center Map" className="lg:col-span-2" flush bodyClassName="p-5 pt-4">
                    {centers.length > 0 ? (
                        <SheltersMap centers={centers} userLocation={userLocation} />
                    ) : (
                        <p className="py-16 text-center text-sm text-slate-400">
                            No evacuation centers have been registered yet.
                        </p>
                    )}
                    <p className="mt-3 text-sm text-slate-500">
                        Locations are maintained by your Local Government Unit. Capacity figures reflect the latest
                        update from the DRRMO and may change during an active emergency.
                    </p>
                </SectionCard>

                <div className="space-y-6">
                    {nearest && (
                        <SectionCard title={userLocation ? 'Nearest Center' : 'Recommended Center'} icon={<Navigation className="h-5 w-5 text-brand-600" />}>
                            <p className="text-base font-bold text-navy-900">{nearest.name}</p>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {nearest.barangay}
                                {nearest.distance_km != null && ` · ${nearest.distance_km} km away`}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                                <Users className="h-4 w-4 text-brand-500" />
                                {nearest.spaces_remaining} of {nearest.capacity} spaces free
                            </div>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${nearest.latitude},${nearest.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                            >
                                <Navigation className="h-4 w-4" /> Get directions
                            </a>
                        </SectionCard>
                    )}

                    <SectionCard title="Emergency Hotlines" icon={<Phone className="h-5 w-5 text-red-500" />}>
                        <div className="space-y-2">
                            {HOTLINES.map((h) => (
                                <a key={h.label} href={`tel:${h.number.replace(/[^0-9]/g, '')}`} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50">
                                    <span className="text-sm font-medium text-navy-900">{h.label}</span>
                                    <span className="text-sm font-bold text-red-600">{h.number}</span>
                                </a>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Preparedness Checklist" icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}>
                        <ul className="space-y-2.5">
                            {CHECKLIST.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </SectionCard>
                </div>
            </div>

            <SectionCard title={`All Centers (${centers.length})`} className="mt-6">
                <div className="space-y-3">
                    {centers.map((center) => (
                        <div
                            key={center.id}
                            className={cn(
                                'rounded-xl border p-4',
                                center.barangay === userBarangay ? 'border-brand-200 bg-brand-50/40' : 'border-slate-200',
                            )}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-navy-900">{center.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {center.address ?? center.barangay}
                                        {center.distance_km != null && ` · ${center.distance_km} km`}
                                    </p>
                                </div>
                                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1', STATUS_STYLE[center.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200')}>
                                    {center.status}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center gap-3">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={cn(
                                            'h-full rounded-full',
                                            center.occupancy_percent >= 90 ? 'bg-red-500' : center.occupancy_percent >= 70 ? 'bg-orange-400' : 'bg-emerald-500',
                                        )}
                                        style={{ width: `${center.occupancy_percent}%` }}
                                    />
                                </div>
                                <span className="shrink-0 text-xs font-medium text-slate-500">
                                    {center.current_occupancy}/{center.capacity}
                                </span>
                            </div>

                            {center.contact_number && (
                                <a href={`tel:${center.contact_number}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                                    <Phone className="h-3.5 w-3.5" /> {center.contact_number}
                                </a>
                            )}
                        </div>
                    ))}
                    {centers.length === 0 && (
                        <p className="py-8 text-center text-sm text-slate-400">No evacuation centers registered.</p>
                    )}
                </div>
            </SectionCard>

            <InfoBanner>
                In an emergency, always call your local hotline first and follow the guidance of official disaster response authorities.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
