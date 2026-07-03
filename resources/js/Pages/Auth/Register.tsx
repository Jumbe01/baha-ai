import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import IconInput from '@/Components/IconInput';
import InputError from '@/Components/InputError';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Lock, Mail, MapPin, Phone, User, UserPlus } from 'lucide-react';
import { FormEventHandler } from 'react';

const USER_TYPES = [
    { value: 'resident', label: 'Citizen / Resident' },
    { value: 'staff', label: 'LGU / Officer' },
    { value: 'responder', label: 'Responder / Volunteer' },
];

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: '',
        role: 'resident',
        address: '',
        terms: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout wide>
            <Head title="Register" />

            <div className="mb-6 flex items-center gap-3">
                <Link
                    href={route('login')}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
                    aria-label="Back to login"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold text-navy-900">Create an Account</h1>
                    <p className="text-sm text-slate-500">Fill in your details to get started</p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full Name" error={errors.name}>
                        <IconInput
                            icon={User}
                            placeholder="Enter your full name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            autoComplete="name"
                            autoFocus
                            required
                        />
                    </Field>
                    <Field label="Email Address" error={errors.email}>
                        <IconInput
                            icon={Mail}
                            type="email"
                            placeholder="Enter your email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </Field>
                    <Field label="Mobile Number" error={errors.mobile}>
                        <IconInput
                            icon={Phone}
                            placeholder="Enter your mobile number"
                            value={data.mobile}
                            onChange={(e) => setData('mobile', e.target.value)}
                            autoComplete="tel"
                        />
                    </Field>
                    <Field label="Password" error={errors.password}>
                        <IconInput
                            icon={Lock}
                            passwordToggle
                            placeholder="Create a password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </Field>
                    <Field label="Confirm Password" error={errors.password_confirmation}>
                        <IconInput
                            icon={Lock}
                            passwordToggle
                            placeholder="Confirm your password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </Field>
                    <Field label="Address" error={errors.address}>
                        <IconInput
                            icon={MapPin}
                            placeholder="Enter your address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            autoComplete="street-address"
                        />
                    </Field>
                </div>

                <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">User Type</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {USER_TYPES.map((t) => (
                            <label
                                key={t.value}
                                className={cn(
                                    'flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                                    data.role === t.value
                                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                                        : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={t.value}
                                    checked={data.role === t.value}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                                />
                                {t.label}
                            </label>
                        ))}
                    </div>
                    <InputError message={errors.role} className="mt-1.5" />
                </div>

                <label className="flex items-start gap-2.5 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={data.terms}
                        onChange={(e) => setData('terms', e.target.checked)}
                        required
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                        I agree to the{' '}
                        <a href="#" className="font-medium text-brand-600 hover:text-brand-700">Terms and Conditions</a>{' '}
                        and{' '}
                        <a href="#" className="font-medium text-brand-600 hover:text-brand-700">Privacy Policy</a>
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                    <UserPlus className="h-5 w-5" />
                    Register
                </button>

                <p className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href={route('login')} className="font-semibold text-brand-600 hover:text-brand-700">
                        Login here
                    </Link>
                </p>
            </form>
        </AuthSplitLayout>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
            {children}
            <InputError message={error} className="mt-1.5" />
        </div>
    );
}
