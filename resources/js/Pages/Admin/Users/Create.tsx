import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import IconInput from '@/Components/IconInput';
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

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'resident',
        mobile: '',
        barangay: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';
    const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

    return (
        <AuthenticatedLayout>
            <Head title="Add User" />

            <PageHeader title="Add User" subtitle="Create a new system account." />

            <div className="mx-auto max-w-2xl">
                <SectionCard title="New User Account">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="role" className={labelClass}>Role</label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className={selectClass}
                                    required
                                >
                                    <option value="resident">Resident</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <InputError message={errors.role} className="mt-1.5" />
                            </div>
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
                        </div>

                        <div>
                            <label htmlFor="barangay" className={labelClass}>Barangay</label>
                            <select
                                id="barangay"
                                value={data.barangay}
                                onChange={(e) => setData('barangay', e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Select barangay</option>
                                {BARANGAYS.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                            <InputError message={errors.barangay} className="mt-1.5" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className={labelClass}>Password</label>
                                <IconInput
                                    icon={Lock}
                                    id="password"
                                    passwordToggle
                                    className="h-11"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>
                            <div>
                                <label htmlFor="password_confirmation" className={labelClass}>Confirm Password</label>
                                <IconInput
                                    icon={Lock}
                                    id="password_confirmation"
                                    passwordToggle
                                    className="h-11"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-1.5" />
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
                                Create User
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
