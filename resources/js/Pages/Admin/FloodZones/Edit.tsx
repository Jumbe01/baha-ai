import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import { Head, Link, useForm } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import { FormEventHandler } from 'react';

const BARANGAYS = [
    'Cabangahan', 'Canjulao', 'Casili', 'Consolacion Poblacion',
    'Danglag', 'Garing', 'Jugan', 'Lamac', 'Lanipga',
    'Nangka', 'Panas', 'Panoypoy', 'Pitogo', 'Sacsac',
    'Tayud', 'Tilhaong', 'Tolotolo', 'Tugbongan',
];

const inputClass =
    'h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

interface FloodZone {
    id: number;
    name: string;
    description: string | null;
    barangay: string;
    safe_threshold: number;
    warning_threshold: number;
    critical_threshold: number;
    coordinates: Array<{ lat: number; lng: number }>;
    is_active: boolean;
}

export default function Edit({ floodZone }: { floodZone: FloodZone }) {
    const { data, setData, put, processing, errors } = useForm({
        name: floodZone.name,
        description: floodZone.description || '',
        barangay: floodZone.barangay,
        safe_threshold: String(floodZone.safe_threshold),
        warning_threshold: String(floodZone.warning_threshold),
        critical_threshold: String(floodZone.critical_threshold),
        coordinates: floodZone.coordinates,
        is_active: floodZone.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.flood-zones.update', floodZone.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Flood Zone" />

            <PageHeader
                title="Edit Flood Zone"
                subtitle={floodZone.name}
                icon={
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                        <MapPin className="h-6 w-6 text-brand-500" />
                    </span>
                }
            />

            <div className="mx-auto max-w-2xl">
                <SectionCard title={`Edit: ${floodZone.name}`}>
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className={labelClass}>Zone Name</label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={inputClass}
                                required
                            />
                            <InputError message={errors.name} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="description" className={labelClass}>Description</label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                                rows={3}
                            />
                            <InputError message={errors.description} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="barangay" className={labelClass}>Barangay</label>
                            <select
                                id="barangay"
                                value={data.barangay}
                                onChange={(e) => setData('barangay', e.target.value)}
                                className={inputClass}
                                required
                            >
                                <option value="">Select barangay</option>
                                {BARANGAYS.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                            <InputError message={errors.barangay} className="mt-1.5" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="safe_threshold" className={labelClass}>Safe (m)</label>
                                <input
                                    id="safe_threshold"
                                    type="number"
                                    step="0.01"
                                    value={data.safe_threshold}
                                    onChange={(e) => setData('safe_threshold', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={errors.safe_threshold} className="mt-1.5" />
                            </div>
                            <div>
                                <label htmlFor="warning_threshold" className={labelClass}>Warning (m)</label>
                                <input
                                    id="warning_threshold"
                                    type="number"
                                    step="0.01"
                                    value={data.warning_threshold}
                                    onChange={(e) => setData('warning_threshold', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={errors.warning_threshold} className="mt-1.5" />
                            </div>
                            <div>
                                <label htmlFor="critical_threshold" className={labelClass}>Critical (m)</label>
                                <input
                                    id="critical_threshold"
                                    type="number"
                                    step="0.01"
                                    value={data.critical_threshold}
                                    onChange={(e) => setData('critical_threshold', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={errors.critical_threshold} className="mt-1.5" />
                            </div>
                        </div>

                        <label htmlFor="is_active" className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm font-semibold text-slate-700">Zone is active</span>
                        </label>

                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                            <Link
                                href={route('admin.flood-zones.index')}
                                className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                            >
                                Update Flood Zone
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
