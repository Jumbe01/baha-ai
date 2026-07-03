import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import IconInput from '@/Components/IconInput';
import InfoBanner from '@/Components/InfoBanner';
import InputError from '@/Components/InputError';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import { Head, Link, useForm } from '@inertiajs/react';
import { MapPin, Radio } from 'lucide-react';
import { FormEventHandler } from 'react';

interface FloodZoneOption {
    id: number;
    name: string;
}

export default function Create({ floodZones }: { floodZones: FloodZoneOption[] }) {
    const { data, setData, post, processing, errors } = useForm({
        flood_zone_id: '',
        name: '',
        type: 'ultrasonic',
        latitude: '10.3667',
        longitude: '123.9567',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.sensors.store'));
    };

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';
    const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

    return (
        <AuthenticatedLayout>
            <Head title="Add Sensor" />

            <PageHeader title="Add Sensor" subtitle="Register a new IoT sensor for flood monitoring." />

            <div className="mx-auto max-w-2xl">
                <SectionCard title="New Sensor">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className={labelClass}>Sensor Name</label>
                            <IconInput
                                icon={Radio}
                                id="name"
                                className="h-11"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="flood_zone_id" className={labelClass}>Flood Zone</label>
                            <select
                                id="flood_zone_id"
                                value={data.flood_zone_id}
                                onChange={(e) => setData('flood_zone_id', e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="">Select flood zone</option>
                                {floodZones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.flood_zone_id} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="type" className={labelClass}>Sensor Type</label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="ultrasonic">Ultrasonic</option>
                                <option value="rain_gauge">Rain Gauge</option>
                                <option value="pressure">Pressure</option>
                            </select>
                            <InputError message={errors.type} className="mt-1.5" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="latitude" className={labelClass}>Latitude</label>
                                <IconInput
                                    icon={MapPin}
                                    id="latitude"
                                    type="number"
                                    step="0.000001"
                                    className="h-11"
                                    value={data.latitude}
                                    onChange={(e) => setData('latitude', e.target.value)}
                                    required
                                />
                                <InputError message={errors.latitude} className="mt-1.5" />
                            </div>
                            <div>
                                <label htmlFor="longitude" className={labelClass}>Longitude</label>
                                <IconInput
                                    icon={MapPin}
                                    id="longitude"
                                    type="number"
                                    step="0.000001"
                                    className="h-11"
                                    value={data.longitude}
                                    onChange={(e) => setData('longitude', e.target.value)}
                                    required
                                />
                                <InputError message={errors.longitude} className="mt-1.5" />
                            </div>
                        </div>

                        <InfoBanner className="mt-0">
                            Default coordinates are set to Consolacion center. The interactive map picker will be available in Phase 5.
                        </InfoBanner>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('admin.sensors.index')}
                                className="flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                            >
                                Create Sensor
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
