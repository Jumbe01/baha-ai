import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import IconInput from '@/Components/IconInput';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn, Lock, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';
import { GoogleIcon, FacebookIcon } from '@/Components/Auth/SocialIcons';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout>
            <Head title="Log in" />

            <div className="text-center">
                <h1 className="font-display text-3xl font-bold text-navy-900">Welcome Back!</h1>
                <p className="mt-2 text-slate-500">Please login to your account</p>
            </div>

            {status && (
                <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Email Address
                    </label>
                    <IconInput
                        id="email"
                        icon={Mail}
                        type="email"
                        placeholder="Enter your email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username"
                        autoFocus
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Password
                    </label>
                    <IconInput
                        id="password"
                        icon={Lock}
                        passwordToggle
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        Remember me
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                            Forgot Password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                    <LogIn className="h-5 w-5" />
                    Login
                </button>

                <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-sm text-slate-400">or continue with</span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <a
                        href={route('oauth.redirect', 'google')}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        <GoogleIcon className="h-5 w-5" />
                        Google
                    </a>
                    <a
                        href={route('oauth.redirect', 'facebook')}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        <FacebookIcon className="h-5 w-5" />
                        Facebook
                    </a>
                </div>

                <p className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link href={route('register')} className="font-semibold text-brand-600 hover:text-brand-700">
                        Register here
                    </Link>
                </p>
            </form>
        </AuthSplitLayout>
    );
}
