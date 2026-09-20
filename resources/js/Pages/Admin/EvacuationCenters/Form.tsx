import IconInput from '@/Components/IconInput';
import InputError from '@/Components/InputError';
import SectionCard from '@/Components/SectionCard';
import { Link } from '@inertiajs/react';
import { Home, MapPin, Phone, Users } from 'lucide-react';
import { FormEventHandler } from 'react';

export interface CenterFormData {
    flood_zone_id: string;
    name: string;
    barangay: string;
    address: string;
    capacity: string;
    current_occupancy: string;
    latitude: string;
    longitude: string;
    contact_number: string;
    status: string;
    is_active: boolean;
    [key: string]: string | boolean;
}

interface FloodZoneOption {
    id: number;
    name: string;
    barangay: string;
}

interface Props {
    title: string;
    submitLabel: string;
    data: CenterFormData;
    setData: (key: string, value: string | boolean) => void;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    floodZones: FloodZoneOption[];
}

const selectClass =
    'h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

export default function CenterForm({
    title,
    submitLabel,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    floodZones,
}: Props) {
    return (
        <div className="mx-auto max-w-2xl">
            <SectionCard title={title}>
                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className={labelClass}>Center Name</label>
                        <IconInput
                            icon={Home}
                            id="name"
                            className="h-11"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1.5" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="barangay" className={labelClass}>Barangay</label>
                            <IconInput
                                icon={MapPin}
                                id="barangay"
                                className="h-11"
                                value={data.barangay}
                                onChange={(e) => setData('barangay', e.target.value)}
                                required
                            />
                            <InputError message={errors.barangay} className="mt-1.5" />
                        </div>
                        <div>
                            <label htmlFor="flood_zone_id" className={labelClass}>Flood Zone (optional)</label>
                            <select
                                id="flood_zone_id"
                                value={data.flood_zone_id}
                                onChange={(e) => setData('flood_zone_id', e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Not linked to a zone</option>
                                {floodZones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name} ({zone.barangay})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.flood_zone_id} className="mt-1.5" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="address" className={labelClass}>Address</label>
                        <IconInput
                            icon={MapPin}
                            id="address"
                            className="h-11"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        <InputError message={errors.address} className="mt-1.5" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="capacity" className={labelClass}>Capacity</label>
                            <IconInput
                                icon={Users}
                                id="capacity"
                                type="number"
                                min="1"
                                className="h-11"
                                value={data.capacity}
                                onChange={(e) => setData('capacity', e.target.value)}
                                required
                            />
                            <InputError message={errors.capacity} className="mt-1.5" />
                        </div>
                        <div>
                            <label htmlFor="current_occupancy" className={labelClass}>Current Occupancy</label>
                            <IconInput
                                icon={Users}
                                id="current_occupancy"
                                type="number"
                                min="0"
                                className="h-11"
                                value={data.current_occupancy}
                                onChange={(e) => setData('current_occupancy', e.target.value)}
                            />
                            <InputError message={errors.current_occupancy} className="mt-1.5" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="contact_number" className={labelClass}>Contact Number</label>
                            <IconInput
                                icon={Phone}
                                id="contact_number"
                                className="h-11"
                                value={data.contact_number}
                                onChange={(e) => setData('contact_number', e.target.value)}
                            />
                            <InputError message={errors.contact_number} className="mt-1.5" />
                        </div>
                        <div>
                            <label htmlFor="status" className={labelClass}>Availability</label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="open">Open</option>
                                <option value="full">Full</option>
                                <option value="closed">Closed</option>
                            </select>
                            <InputError message={errors.status} className="mt-1.5" />
                        </div>
                    </div>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        Active — show this center to residents
                    </label>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href={route('admin.evacuation-centers.index')}
                            className="flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                        >
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </SectionCard>
        </div>
    );
}
