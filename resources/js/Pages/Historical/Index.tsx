import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head } from '@inertiajs/react';

export default function HistoricalIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Historical Data" />
            <PageHeader title="Historical Data & Analytics" subtitle="Explore historical flood, rainfall, and water level data." />
        </AuthenticatedLayout>
    );
}
