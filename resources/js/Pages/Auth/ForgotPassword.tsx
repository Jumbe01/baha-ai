import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import IconInput from '@/Components/IconInput';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthSplitLayout compact>
            <Head title="Forgot Password" />

            <Link
                href={route('login')}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>

            <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-navy-900">Forgot Password?</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Enter your email and we'll send you a link to reset your password.
                </p>
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
                        autoFocus
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                    <Send className="h-5 w-5" />
                    Email Password Reset Link
                </button>
            </form>
        </AuthSplitLayout>
    );
}
