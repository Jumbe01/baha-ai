import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyOtp({ email }: { email: string }) {
    const verifyForm = useForm({ code: '' });
    const resendForm = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        verifyForm.post(route('verification.otp.verify'));
    };

    const resend = () => {
        resendForm.post(route('verification.otp.resend'));
    };

    return (
        <GuestLayout>
            <Head title="Verify Email" />

            <div className="mb-4 text-sm text-gray-600">
                We've sent a 6-digit verification code to{' '}
                <span className="font-medium text-gray-900">{email}</span>.
                Enter the code below to verify your email address.
            </div>

            <form onSubmit={submit}>
                <div>
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                        id="code"
                        type="text"
                        value={verifyForm.data.code}
                        onChange={(e) => verifyForm.setData('code', e.target.value)}
                        maxLength={6}
                        className="mt-1 text-center text-2xl tracking-[0.5em] font-mono"
                        autoFocus
                        placeholder="000000"
                    />
                    {verifyForm.errors.code && (
                        <p className="mt-2 text-sm text-red-600">{verifyForm.errors.code}</p>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={resend}
                        disabled={resendForm.processing}
                        className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                    >
                        Resend Code
                    </button>

                    <Button type="submit" disabled={verifyForm.processing}>
                        Verify
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
