import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

const LENGTH = 6;

export default function VerifyOtp({ email }: { email: string }) {
    const verifyForm = useForm({ code: '' });
    const resendForm = useForm({});
    const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
    const [seconds, setSeconds] = useState(179);
    const inputs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (seconds <= 0) return;
        const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [seconds]);

    const setDigit = (index: number, value: string) => {
        const char = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        verifyForm.setData('code', next.join(''));
        if (char && index < LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
        if (!pasted) return;
        const next = Array(LENGTH).fill('');
        pasted.split('').forEach((c, i) => (next[i] = c));
        setDigits(next);
        verifyForm.setData('code', next.join(''));
        inputs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        verifyForm.post(route('verification.otp.verify'));
    };

    const resend = () => {
        resendForm.post(route('verification.otp.resend'), {
            onSuccess: () => setSeconds(179),
        });
    };

    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');

    return (
        <AuthSplitLayout compact>
            <Head title="Verify Account" />

            <Link
                href={route('register')}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </Link>

            <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                    <MailCheck className="h-7 w-7 text-brand-600" />
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold text-navy-900">Verify Your Account</h1>
                <p className="mt-2 text-sm text-slate-500">Enter the 6-digit code sent to</p>
                <p className="font-semibold text-brand-600">{email}</p>
            </div>

            <form onSubmit={submit} className="mt-8">
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => setDigit(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            autoFocus={i === 0}
                            className="h-14 w-12 rounded-xl border border-slate-300 text-center font-display text-2xl font-bold text-navy-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 sm:h-16 sm:w-14"
                        />
                    ))}
                </div>

                {verifyForm.errors.code && (
                    <p className="mt-3 text-center text-sm text-red-600">{verifyForm.errors.code}</p>
                )}

                <p className="mt-5 text-center text-sm text-slate-500">
                    Code expires in{' '}
                    <span className="font-semibold text-brand-600">{mm}:{ss}</span>
                </p>

                <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-sm text-slate-400">Didn't receive the code?</span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>
                <button
                    type="button"
                    onClick={resend}
                    disabled={resendForm.processing || seconds > 0}
                    className="mx-auto block text-sm font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
                >
                    Resend Code
                </button>

                <button
                    type="submit"
                    disabled={verifyForm.processing || verifyForm.data.code.length < LENGTH}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                    <ShieldCheck className="h-5 w-5" />
                    Verify
                </button>

                <Link
                    href={route('register')}
                    className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 font-semibold text-brand-600 transition-colors hover:bg-slate-50"
                >
                    <ArrowLeft className="h-5 w-5" /> Back to Registration
                </Link>
            </form>
        </AuthSplitLayout>
    );
}
