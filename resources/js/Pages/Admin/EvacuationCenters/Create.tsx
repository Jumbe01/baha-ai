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

export default function Create({ floodZones }: { floodZones: FloodZoneOption[] }) {
    const { data, setData, post, processing, errors } = useForm<CenterFormData>({
        flood_zone_id: '',
        name: '',
        barangay: '',
        address: '',
        capacity: '100',
        current_occupancy: '0',
        latitude: '10.3667',
        longitude: '123.9567',
        contact_number: '',
        status: 'open',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.evacuation-centers.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add Evacuation Center" />

            <PageHeader
                title="Add Evacuation Center"
                subtitle="Register a designated shelter so residents can find it."
            />

            <CenterForm
                title="New Evacuation Center"
                submitLabel="Create Center"
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
