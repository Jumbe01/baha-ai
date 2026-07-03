import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FloodMap from '@/Components/Map/FloodMap';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { Clock, Search } from 'lucide-react';
import { useState } from 'react';

interface Props {
    center: { lat: number; lng: number };
}

const TIME_VIEWS = ['Past', 'Now', 'Predicted'] as const;

const LEGEND = [
    ['Safe Zone', 'bg-emerald-500'],
    ['Warning Zone', 'bg-amber-400'],
    ['Critical Zone', 'bg-red-500'],
    ['Flooded Area (Live)', 'bg-brand-400'],
    ['Water Level Sensor', 'bg-brand-600'],
    ['Evacuation Center', 'bg-emerald-600'],
];

const OVERLAYS = [
    { label: 'Live Flood Extent', desc: 'Current flooded areas from IoT sensors' },
    { label: 'AI Prediction (1 Hour)', desc: 'Predicted flood extent overlay' },
    { label: 'Rainfall Intensity', desc: 'Rainfall heatmap overlay' },
    { label: 'Flood Prone Areas', desc: 'Historical flood-prone zones' },
    { label: 'Sensor Locations', desc: 'Water level & rainfall sensors' },
];

export default function MapIndex({ center }: Props) {
    const [timeView, setTimeView] = useState<(typeof TIME_VIEWS)[number]>('Now');
    const [overlays, setOverlays] = useState<Record<string, boolean>>(
        Object.fromEntries(OVERLAYS.map((o) => [o.label, true])),
    );

    return (
        <AuthenticatedLayout>
            <Head title="Flood Map" />

            <PageHeader
                title="GIS Mapping & Flood Visualization"
                subtitle="Explore real-time flood conditions, flood-prone areas, and prediction overlays on the map."
                actions={
                    <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 text-brand-500" />
                        {new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                }
            />

            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
                    <span className="pl-2 text-sm font-medium text-slate-500">Time View</span>
                    {TIME_VIEWS.map((v) => (
                        <button
                            key={v}
                            onClick={() => setTimeView(v)}
                            className={cn('rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors', timeView === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50')}
                        >
                            {v}
                        </button>
                    ))}
                </div>
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Search location…"
                        className="h-10 w-full rounded-xl border-slate-300 pl-10 text-sm focus:border-brand-500 focus:ring-brand-500"
                    />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="relative h-[560px] overflow-hidden rounded-2xl border border-slate-200">
                        <FloodMap center={center} geojsonUrl="/api/map/geojson" sensorsUrl="/api/map/sensors" />
                    </div>
                </div>

                <div className="space-y-6">
                    <SectionCard title="Map Legend">
                        <div className="grid grid-cols-2 gap-2.5">
                            {LEGEND.map(([label, color]) => (
                                <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className={cn('h-3 w-3 shrink-0 rounded-full', color)} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Map Overlays">
                        <div className="space-y-3">
                            {OVERLAYS.map((o) => (
                                <label key={o.label} className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={overlays[o.label]}
                                        onChange={(e) => setOverlays((s) => ({ ...s, [o.label]: e.target.checked }))}
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-navy-900">{o.label}</p>
                                        <p className="text-xs text-slate-500">{o.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <InfoBanner trailing={`Last updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>
                This map shows real-time data from IoT sensors, rainfall stations, and AI predictions. Map updates automatically.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
