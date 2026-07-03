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

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        barangay: '',
        safe_threshold: '0',
        warning_threshold: '1.5',
        critical_threshold: '3.0',
        coordinates: [
            { lat: 10.3667, lng: 123.9567 },
            { lat: 10.3697, lng: 123.9567 },
            { lat: 10.3697, lng: 123.9597 },
            { lat: 10.3667, lng: 123.9597 },
            { lat: 10.3667, lng: 123.9567 },
        ],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.flood-zones.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Flood Zone" />

            <PageHeader
                title="Create Flood Zone"
                subtitle="Add a new flood monitoring zone."
                icon={
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                        <MapPin className="h-6 w-6 text-brand-500" />
                    </span>
                }
            />

            <div className="mx-auto max-w-2xl">
                <SectionCard title="New Flood Zone">
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

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-700">Zone Coordinates (GeoJSON polygon)</p>
                            <p className="mt-1 text-xs text-slate-500">
                                Default coordinates are set around Consolacion center. The map picker will be available in Phase 5.
                            </p>
                        </div>

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
                                Create Flood Zone
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
