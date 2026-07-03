import IconInput from '@/Components/IconInput';
import InputError from '@/Components/InputError';
import SectionCard from '@/Components/SectionCard';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

export default function UpdatePasswordForm({ className }: { className?: string }) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <SectionCard title="Security Settings" icon={<ShieldCheck className="h-5 w-5 text-brand-600" />} className={className}>
            <p className="-mt-1 mb-4 text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>

            <form onSubmit={updatePassword} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Current Password</label>
                    <IconInput ref={currentPasswordInput} icon={Lock} passwordToggle value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} autoComplete="current-password" />
                    <InputError message={errors.current_password} className="mt-1.5" />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">New Password</label>
                    <IconInput ref={passwordInput} icon={Lock} passwordToggle value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm Password</label>
                    <IconInput icon={Lock} passwordToggle value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>
                <div className="flex items-center gap-4 pt-1">
                    <button type="submit" disabled={processing} className="h-11 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                        Update Password
                    </button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm text-emerald-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </SectionCard>
    );
}
