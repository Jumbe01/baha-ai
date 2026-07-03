import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head } from '@inertiajs/react';

export default function AboutIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="About BahaAI" />
            <PageHeader title="About BahaAI" subtitle="Learn more about the IoT-Based Flood Alert System." />
        </AuthenticatedLayout>
    );
}
