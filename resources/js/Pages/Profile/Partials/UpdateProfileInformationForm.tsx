import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const BARANGAYS = [
    'Cabangahan', 'Canjulao', 'Casili', 'Consolacion Poblacion',
    'Danglag', 'Garing', 'Jugan', 'Lamac', 'Lanipga',
    'Nangka', 'Panas', 'Panoypoy', 'Pitogo', 'Sacsac',
    'Tayud', 'Tilhaong', 'Tolotolo', 'Tugbongan',
];

export default function UpdateProfileInformationForm({
    status,
    className = '',
}: {
    status?: string;
    className?: string;
}) {
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
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account profile information, contact details, and notification preferences.
                </p>
            </header>

            {status && (
                <div className="mt-2 text-sm font-medium text-green-600">{status}</div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1"
                        required
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1"
                        required
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                        id="mobile"
                        value={data.mobile}
                        onChange={(e) => setData('mobile', e.target.value)}
                        className="mt-1"
                        placeholder="09xxxxxxxxx"
                    />
                    {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
                </div>

                <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        className="mt-1"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                <div>
                    <Label htmlFor="barangay">Barangay</Label>
                    <select
                        id="barangay"
                        value={data.barangay}
                        onChange={(e) => setData('barangay', e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select barangay</option>
                        {BARANGAYS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    {errors.barangay && <p className="mt-1 text-sm text-red-600">{errors.barangay}</p>}
                </div>

                <div>
                    <Label>Notification Preferences</Label>
                    <div className="mt-2 space-y-2">
                        {(['email', 'sms', 'push'] as const).map((channel) => (
                            <label key={channel} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.notification_preference[channel]}
                                    onChange={(e) =>
                                        setData('notification_preference', {
                                            ...data.notification_preference,
                                            [channel]: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">{channel} notifications</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>Save</Button>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
