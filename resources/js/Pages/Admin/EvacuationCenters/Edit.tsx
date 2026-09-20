import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import CenterForm, { type CenterFormData } from './Form';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface FloodZoneOption {
    id: number;
    name: string;
    barangay: string;
}

interface Center {
    id: number;
    flood_zone_id: number | null;
    name: string;
    barangay: string;
    address: string | null;
    capacity: number;
    current_occupancy: number;
    latitude: string | number;
    longitude: string | number;
    contact_number: string | null;
    status: string;
    is_active: boolean;
}

export default function Edit({ center, floodZones }: { center: Center; floodZones: FloodZoneOption[] }) {
    const { data, setData, put, processing, errors } = useForm<CenterFormData>({
        flood_zone_id: center.flood_zone_id ? String(center.flood_zone_id) : '',
        name: center.name,
        barangay: center.barangay,
        address: center.address ?? '',
        capacity: String(center.capacity),
        current_occupancy: String(center.current_occupancy),
        latitude: String(center.latitude),
        longitude: String(center.longitude),
        contact_number: center.contact_number ?? '',
        status: center.status,
        is_active: center.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.evacuation-centers.update', center.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${center.name}`} />

            <PageHeader title="Edit Evacuation Center" subtitle={center.name} />

            <CenterForm
                title="Center Details"
                submitLabel="Save Changes"
                data={data}
                setData={setData as (key: string, value: string | boolean) => void}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                floodZones={floodZones}
            />
        </AuthenticatedLayout>
    );
}
