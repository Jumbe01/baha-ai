import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import IconInput from '@/Components/IconInput';
import InfoBanner from '@/Components/InfoBanner';
import InputError from '@/Components/InputError';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { FormEventHandler } from 'react';

const BARANGAYS = [
    'Cabangahan', 'Canjulao', 'Casili', 'Consolacion Poblacion',
    'Danglag', 'Garing', 'Jugan', 'Lamac', 'Lanipga',
    'Nangka', 'Panas', 'Panoypoy', 'Pitogo', 'Sacsac',
    'Tayud', 'Tilhaong', 'Tolotolo', 'Tugbongan',
];

interface EditableUser {
    id: number;
    name: string;
    email: string;
    role: string;
    mobile: string | null;
    barangay: string | null;
}

export default function Edit({ user }: { user: EditableUser }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile ?? '',
        barangay: user.barangay ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';
    const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${user.name}`} />

            <PageHeader title="Edit User" subtitle={user.email} />

            <div className="mx-auto max-w-2xl">
                <SectionCard title="Account Details">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className={labelClass}>Full Name</label>
                            <IconInput
                                icon={User}
                                id="name"
                                className="h-11"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClass}>Email</label>
                            <IconInput
                                icon={Mail}
                                id="email"
                                type="email"
                                className="h-11"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="role" className={labelClass}>Role</label>
                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="resident">Community Resident</option>
                                <option value="staff">DRRMO / Staff</option>
                                <option value="admin">Administrator</option>
                            </select>
                            <InputError message={errors.role} className="mt-1.5" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="mobile" className={labelClass}>Mobile</label>
                                <IconInput
                                    icon={Phone}
                                    id="mobile"
                                    className="h-11"
                                    value={data.mobile}
                                    onChange={(e) => setData('mobile', e.target.value)}
                                />
                                <InputError message={errors.mobile} className="mt-1.5" />
                            </div>
                            <div>
                                <label htmlFor="barangay" className={labelClass}>Barangay</label>
                                <select
                                    id="barangay"
                                    value={data.barangay}
                                    onChange={(e) => setData('barangay', e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">Not set</option>
                                    {BARANGAYS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                <InputError message={errors.barangay} className="mt-1.5" />
                            </div>
                        </div>

                        <InfoBanner className="mt-0">
                            Leave the password fields blank to keep the current password unchanged.
                        </InfoBanner>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="password" className={labelClass}>New Password</label>
                                <IconInput
                                    icon={Lock}
                                    id="password"
                                    type="password"
                                    className="h-11"
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>
                            <div>
                                <label htmlFor="password_confirmation" className={labelClass}>Confirm Password</label>
                                <IconInput
                                    icon={Lock}
                                    id="password_confirmation"
                                    type="password"
                                    className="h-11"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('admin.users.index')}
                                className="flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
