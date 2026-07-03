import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link, usePage } from '@inertiajs/react';
import { LogOut, Mail, MapPin, Phone } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrator',
    staff: 'LGU / Officer',
    resident: 'Citizen / Resident',
    responder: 'Responder / Volunteer',
};

export default function Edit({ status }: { status?: string }) {
    const user = usePage().props.auth.user as {
        name: string;
        email: string;
        role: string;
        mobile?: string;
        address?: string;
        barangay?: string;
    };
    const roleLabel = ROLE_LABELS[user.role] ?? user.role;

    return (
        <AuthenticatedLayout>
            <Head title="Profile & Settings" />

            <PageHeader title="Profile & Settings" subtitle="Manage your account, preferences, and security settings." />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile summary */}
                <SectionCard title="My Profile">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 font-display text-2xl font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="mt-3 font-display text-lg font-bold text-navy-900">{user.name}</p>
                        <StatusBadge level={user.role === 'admin' ? 'critical' : user.role === 'staff' ? 'info' : 'neutral'} label={roleLabel} className="mt-1" />
                    </div>
                    <dl className="mt-5 space-y-3 text-sm">
                        <Info icon={Mail} value={user.email} />
                        {user.mobile && <Info icon={Phone} value={user.mobile} />}
                        {(user.address || user.barangay) && <Info icon={MapPin} value={[user.address, user.barangay].filter(Boolean).join(', ')} />}
                    </dl>
                    <Link href={route('location.select')} className="mt-5 block rounded-xl border border-slate-300 py-2.5 text-center text-sm font-semibold text-brand-600 hover:bg-slate-50">
                        Update Location
                    </Link>
                </SectionCard>

                {/* Editable info spans two columns */}
                <div className="lg:col-span-2">
                    <UpdateProfileInformationForm status={status} />
                </div>

                <div className="lg:col-span-2">
                    <UpdatePasswordForm />
                </div>

                {/* Logout card */}
                <SectionCard title="Session">
                    <p className="mb-4 text-sm text-slate-500">Sign out of your account on this device.</p>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </Link>
                </SectionCard>

                <div className="lg:col-span-3">
                    <DeleteUserForm />
                </div>
            </div>

            <InfoBanner>
                Your data is secure with us. BahaAI is committed to protecting your privacy and providing accurate flood information.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}

function Info({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
    return (
        <div className="flex items-center gap-3 text-slate-600">
            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{value}</span>
        </div>
    );
}
