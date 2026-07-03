import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Camera, Crosshair, X } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const SEVERITIES = [
    { value: 'minor', label: 'Minor', tone: 'bg-amber-50 text-amber-700 border-amber-300' },
    { value: 'moderate', label: 'Moderate', tone: 'bg-orange-50 text-orange-700 border-orange-300' },
    { value: 'severe', label: 'Severe', tone: 'bg-red-50 text-red-700 border-red-300' },
];

export default function ReportFloodModal({ show, onClose }: { show: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        severity: 'moderate',
        description: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });
    const [locating, setLocating] = useState(false);

    const useLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setData((d) => ({
                    ...d,
                    latitude: Number(pos.coords.latitude.toFixed(6)),
                    longitude: Number(pos.coords.longitude.toFixed(6)),
                }));
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const close = () => {
        reset();
        onClose();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('flood-reports.store'), {
            preserveScroll: true,
            onSuccess: () => close(),
        });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="lg">
            <form onSubmit={submit} className="p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                            <Camera className="h-6 w-6 text-brand-600" />
                        </span>
                        <div>
                            <h2 className="font-display text-lg font-semibold text-navy-900">Report Flooding</h2>
                            <p className="text-sm text-slate-500">Help your community by reporting what you see.</p>
                        </div>
                    </div>
                    <button type="button" onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Severity</label>
                        <div className="grid grid-cols-3 gap-3">
                            {SEVERITIES.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setData('severity', s.value)}
                                    className={cn(
                                        'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors',
                                        data.severity === s.value ? s.tone : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <InputError message={errors.severity} className="mt-1.5" />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">What's happening?</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                            placeholder="Describe the flooding — location, water depth, affected roads or homes…"
                            className="w-full rounded-xl border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                            required
                        />
                        <InputError message={errors.description} className="mt-1.5" />
                    </div>

                    <button
                        type="button"
                        onClick={useLocation}
                        disabled={locating}
                        className={cn(
                            'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors',
                            data.latitude != null
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-slate-300 text-slate-700 hover:bg-slate-50',
                        )}
                    >
                        <Crosshair className="h-4 w-4" />
                        {locating ? 'Getting location…' : data.latitude != null ? 'Location attached ✓' : 'Attach my current location'}
                    </button>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={close} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="h-10 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                        Submit Report
                    </button>
                </div>
            </form>
        </Modal>
    );
}
