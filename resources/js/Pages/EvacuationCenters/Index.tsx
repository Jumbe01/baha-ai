import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import { Head } from '@inertiajs/react';
import { Home, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react';

const HOTLINES = [
    { label: 'National Emergency Hotline', number: '911' },
    { label: 'NDRRMC Operations Center', number: '(02) 8911-1406' },
    { label: 'Philippine Red Cross', number: '143' },
    { label: 'Local DRRMO', number: '(032) 000-0000' },
];

const CHECKLIST = [
    'Prepare a go-bag with water, food, medicine, and important documents.',
    'Know the fastest route to your nearest evacuation center.',
    'Keep phones charged and monitor official BahaAI alerts.',
    'Follow instructions from local disaster response officers.',
];

export default function EvacuationCentersIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Evacuation Centers" />

            <PageHeader
                title="Evacuation Centers"
                subtitle="Find nearby evacuation centers, safe routes, and emergency contacts."
                icon={<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50"><Home className="h-6 w-6 text-brand-600" /></span>}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <SectionCard
                    title="Nearest Centers Map"
                    className="lg:col-span-2"
                    action={<button className="flex items-center gap-2 text-sm font-semibold text-brand-600"><Navigation className="h-4 w-4" /> Show Safe Route</button>}
                    flush
                    bodyClassName="p-5 pt-4"
                >
                    <div className="relative h-80 overflow-hidden rounded-xl bg-slate-100">
                        <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                            <rect width="400" height="300" fill="#e8edf2" />
                            <rect x="0" y="0" width="150" height="100" fill="#dfeadd" />
                            <rect x="280" y="180" width="120" height="120" fill="#dfeadd" />
                            <path d="M-10 70 C90 100 130 40 210 90 S360 170 410 140" stroke="#9cc6e8" strokeWidth="24" fill="none" opacity="0.8" />
                            <g stroke="#ffffff" strokeWidth="4" opacity="0.8">
                                <line x1="0" y1="200" x2="400" y2="220" />
                                <line x1="160" y1="0" x2="220" y2="300" />
                            </g>
                        </svg>
                        {[
                            { x: '30%', y: '40%' },
                            { x: '62%', y: '55%' },
                            { x: '45%', y: '72%' },
                        ].map((p, i) => (
                            <span key={i} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: p.x, top: p.y }}>
                                <Home className="h-7 w-7 fill-emerald-600 text-white drop-shadow" />
                            </span>
                        ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        Evacuation center locations are provided and maintained by your Local Government Unit (LGU).
                        Contact your barangay for the officially designated center nearest you.
                    </p>
                </SectionCard>

                <div className="space-y-6">
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

            <InfoBanner>
                In an emergency, always call your local hotline first and follow the guidance of official disaster response authorities.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
