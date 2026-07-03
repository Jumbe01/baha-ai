import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import IconInput from '@/Components/IconInput';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, Lock, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout compact>
            <Head title="Reset Password" />

            <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                    <KeyRound className="h-7 w-7 text-brand-600" />
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold text-navy-900">Reset Password</h1>
                <p className="mt-2 text-sm text-slate-500">Choose a new password for your account.</p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
                    <IconInput
                        icon={Mail}
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username"
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">New Password</label>
                    <IconInput
                        icon={Lock}
                        passwordToggle
                        placeholder="Enter new password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        autoFocus
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm Password</label>
                    <IconInput
                        icon={Lock}
                        passwordToggle
                        placeholder="Confirm new password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                    Reset Password
                </button>
            </form>
        </AuthSplitLayout>
    );
}
