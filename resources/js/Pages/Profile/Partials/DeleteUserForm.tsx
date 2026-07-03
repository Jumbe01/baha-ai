import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import SectionCard from '@/Components/SectionCard';
import { useForm } from '@inertiajs/react';
import { LogOut, Trash2 } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({ className }: { className?: string }) {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <SectionCard className={className}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                        <Trash2 className="h-5 w-5 text-red-500" />
                    </span>
                    <div>
                        <h2 className="font-display text-lg font-semibold text-navy-900">Delete Account</h2>
                        <p className="text-sm text-slate-500">Once deleted, all of your data will be permanently removed.</p>
                    </div>
                </div>
                <button
                    onClick={() => setConfirming(true)}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                    <LogOut className="h-4 w-4" /> Delete Account
                </button>
            </div>

            <Modal show={confirming} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="font-display text-lg font-semibold text-navy-900">Are you sure you want to delete your account?</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        This action is permanent. Please enter your password to confirm.
                    </p>
                    <div className="mt-6">
                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="h-12 w-full rounded-xl border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                        />
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                            Delete Account
                        </button>
                    </div>
                </form>
            </Modal>
        </SectionCard>
    );
}
