import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import IconInput from '@/Components/IconInput';
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

interface Sensor {
    id: number;
    name: string;
    type: string;
    flood_zone_id: number;
    latitude: number;
    longitude: number;
    status: string;
}

export default function Edit({ sensor, floodZones }: { sensor: Sensor; floodZones: FloodZoneOption[] }) {
    const { data, setData, put, processing, errors } = useForm({
        flood_zone_id: String(sensor.flood_zone_id),
        name: sensor.name,
        type: sensor.type,
        latitude: String(sensor.latitude),
        longitude: String(sensor.longitude),
        status: sensor.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.sensors.update', sensor.id));
    };

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';
    const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

    return (
        <AuthenticatedLayout>
            <Head title="Edit Sensor" />

            <PageHeader title="Edit Sensor" subtitle={`Update configuration for ${sensor.name}.`} />

            <div className="mx-auto max-w-2xl">
                <SectionCard title={`Edit: ${sensor.name}`}>
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

                        <div>
                            <label htmlFor="status" className={labelClass}>Status</label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                            <InputError message={errors.status} className="mt-1.5" />
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
                                Update Sensor
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
