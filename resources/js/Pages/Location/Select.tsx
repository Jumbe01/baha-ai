import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import InfoBanner from '@/Components/InfoBanner';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Crosshair, MapPin, Search } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Props {
    current: {
        address: string | null;
        barangay: string | null;
        latitude: number | null;
        longitude: number | null;
    };
}

export default function SelectLocation({ current }: Props) {
    const { data, setData, patch, processing } = useForm({
        address: current.address ?? '',
        barangay: current.barangay ?? '',
        latitude: current.latitude,
        longitude: current.longitude,
    });
    const [detecting, setDetecting] = useState(false);
    const [search, setSearch] = useState('');

    const detected = data.address || 'Barangay San Isidro, City of Example';

    const useCurrentLocation = () => {
        if (!navigator.geolocation) return;
        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setData((d) => ({
                    ...d,
                    latitude: Number(pos.coords.latitude.toFixed(6)),
                    longitude: Number(pos.coords.longitude.toFixed(6)),
                }));
                setDetecting(false);
            },
            () => setDetecting(false),
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('location.update'));
    };

    return (
        <AuthSplitLayout wide>
            <Head title="Select Your Location" />

            <div className="mb-6 flex items-center justify-between">
                <Link
                    href={route('dashboard')}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
                <button
                    onClick={() => router.visit(route('dashboard'))}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                    Skip for now
                </button>
            </div>

            <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-navy-900">Select Your Location</h1>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                    Allow location access or search your area to receive accurate flood alerts and information.
                </p>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for your location or barangay"
                        className="h-12 w-full rounded-xl border border-slate-300 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    />
                </div>

                <MapPreview />

                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                        <div>
                            <p className="text-xs text-slate-500">Detected Location</p>
                            <p className="font-semibold text-navy-900">{detected}</p>
                            {data.latitude != null && data.longitude != null && (
                                <p className="text-xs text-slate-400">
                                    Coordinates: {data.latitude}, {data.longitude}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={useCurrentLocation}
                        disabled={detecting}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-60"
                    >
                        <Crosshair className="h-4 w-4" />
                        {detecting ? 'Detecting…' : 'Use Current Location'}
                    </button>
                </div>

                <InfoBanner className="mt-0">
                    Your location helps us provide localized flood alerts and updates that are relevant to your area.
                </InfoBanner>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                    <MapPin className="h-5 w-5" />
                    Continue
                </button>
            </form>
        </AuthSplitLayout>
    );
}

/** Stylized static map with a location pin (placeholder for a live map). */
function MapPreview() {
    return (
        <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                <rect width="400" height="200" fill="#e8edf2" />
                {/* Green patches */}
                <rect x="0" y="0" width="120" height="70" fill="#dfeadd" />
                <rect x="300" y="120" width="100" height="80" fill="#dfeadd" />
                {/* River */}
                <path d="M-10 40 C80 60 120 20 200 60 S360 120 410 90" stroke="#9cc6e8" strokeWidth="22" fill="none" opacity="0.8" />
                {/* Roads */}
                <g stroke="#ffffff" strokeWidth="4">
                    <line x1="0" y1="130" x2="400" y2="150" />
                    <line x1="150" y1="0" x2="200" y2="200" />
                    <line x1="60" y1="200" x2="120" y2="0" />
                </g>
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                <MapPin className="h-9 w-9 fill-brand-600 text-white drop-shadow" />
            </div>
            <span className="absolute left-1/2 top-1/2 mt-1 -translate-x-1/2 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-navy-900 shadow">
                San Isidro
            </span>
        </div>
    );
}
