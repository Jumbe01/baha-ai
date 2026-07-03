import IconInput from '@/Components/IconInput';
import InputError from '@/Components/InputError';
import SectionCard from '@/Components/SectionCard';
import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { Bell, Mail, MapPin, MessageSquare, Phone, Smartphone, User } from 'lucide-react';
import { FormEventHandler } from 'react';

const BARANGAYS = [
    'Cabangahan', 'Canjulao', 'Casili', 'Consolacion Poblacion',
    'Danglag', 'Garing', 'Jugan', 'Lamac', 'Lanipga',
    'Nangka', 'Panas', 'Panoypoy', 'Pitogo', 'Sacsac',
    'Tayud', 'Tilhaong', 'Tolotolo', 'Tugbongan',
];

const CHANNELS: { key: 'email' | 'sms' | 'push'; label: string; icon: typeof Mail }[] = [
    { key: 'sms', label: 'SMS Alerts', icon: MessageSquare },
    { key: 'push', label: 'Push Notifications', icon: Smartphone },
    { key: 'email', label: 'Email Notifications', icon: Mail },
];

export default function UpdateProfileInformationForm({ status, className }: { status?: string; className?: string }) {
    const user = usePage().props.auth.user as {
        name: string;
        email: string;
        mobile?: string;
        address?: string;
        barangay?: string;
        notification_preference?: { email: boolean; sms: boolean; push: boolean };
    };

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        address: user.address || '',
        barangay: user.barangay || '',
        notification_preference: user.notification_preference || { email: true, sms: true, push: false },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <SectionCard title="Profile Information" icon={<User className="h-5 w-5 text-brand-600" />} className={className}>
            <p className="-mt-1 mb-4 text-sm text-slate-500">Update your account, contact details, and notification preferences.</p>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full Name" error={errors.name}>
                        <IconInput icon={User} value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    </Field>
                    <Field label="Email Address" error={errors.email}>
                        <IconInput icon={Mail} type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                    </Field>
                    <Field label="Mobile Number" error={errors.mobile}>
                        <IconInput icon={Phone} value={data.mobile} onChange={(e) => setData('mobile', e.target.value)} placeholder="09xxxxxxxxx" />
                    </Field>
                    <Field label="Address" error={errors.address}>
                        <IconInput icon={MapPin} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    </Field>
                </div>

                <Field label="Barangay" error={errors.barangay}>
                    <select
                        value={data.barangay}
                        onChange={(e) => setData('barangay', e.target.value)}
                        className="h-12 w-full rounded-xl border-slate-300 text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    >
                        <option value="">Select barangay</option>
                        {BARANGAYS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </Field>

                <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Bell className="h-4 w-4 text-brand-600" /> Notification Preferences
                    </p>
                    <div className="space-y-2">
                        {CHANNELS.map((c) => (
                            <label key={c.key} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                                <span className="flex items-center gap-3 text-sm font-medium text-navy-900">
                                    <c.icon className="h-4 w-4 text-slate-400" /> {c.label}
                                </span>
                                <Toggle
                                    checked={data.notification_preference[c.key]}
                                    onChange={(v) => setData('notification_preference', { ...data.notification_preference, [c.key]: v })}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                    <button type="submit" disabled={processing} className="h-11 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                        Save Changes
                    </button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm text-emerald-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </SectionCard>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
            {children}
            <InputError message={error} className="mt-1.5" />
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-slate-300')}
        >
            <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
        </button>
    );
}
