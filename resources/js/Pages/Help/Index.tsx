import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head } from '@inertiajs/react';

export default function HelpIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Help & Support" />
            <PageHeader title="Help & Support" subtitle="Guides, FAQs, and ways to reach the BahaAI team." />
        </AuthenticatedLayout>
    );
}
