import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head } from '@inertiajs/react';

export default function EvacuationCentersIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Evacuation Centers" />
            <PageHeader title="Evacuation Centers" subtitle="Find nearby evacuation centers and safe routes." />
        </AuthenticatedLayout>
    );
}
