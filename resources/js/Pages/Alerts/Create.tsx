import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import IconInput from '@/Components/IconInput';
import InfoBanner from '@/Components/InfoBanner';
import InputError from '@/Components/InputError';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import { Head, Link, useForm } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';
import { FormEventHandler } from 'react';

interface FloodZoneOption {
    id: number;
    name: string;
}

export default function Create({ floodZones }: { floodZones: FloodZoneOption[] }) {
    const { data, setData, post, processing, errors } = useForm({
        flood_zone_id: '',
        severity: 'warning',
        title: '',
        message: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('alerts.store'));
    };

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';
    const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

    return (
        <AuthenticatedLayout>
            <Head title="Create Alert" />

            <PageHeader title="Create Alert" subtitle="Dispatch a manual flood alert to affected residents and staff." />

            <div className="mx-auto max-w-2xl">
                <SectionCard title="Manual Alert">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="flood_zone_id" className={labelClass}>Flood Zone</label>
                            <select
                                id="flood_zone_id"
                                value={data.flood_zone_id}
                                onChange={(e) => setData('flood_zone_id', e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="">Select flood zone</option>
                                {floodZones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.flood_zone_id} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="severity" className={labelClass}>Severity</label>
                            <select
                                id="severity"
                                value={data.severity}
                                onChange={(e) => setData('severity', e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                            <InputError message={errors.severity} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="title" className={labelClass}>Title</label>
                            <IconInput
                                icon={Megaphone}
                                id="title"
                                className="h-11"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            <InputError message={errors.title} className="mt-1.5" />
                        </div>

                        <div>
                            <label htmlFor="message" className={labelClass}>Message</label>
                            <textarea
                                id="message"
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                                rows={4}
                                required
                            />
                            <InputError message={errors.message} className="mt-1.5" />
                        </div>

                        <InfoBanner className="mt-0">
                            Creating this alert will immediately dispatch notifications to all residents in the affected barangay and all staff members.
                        </InfoBanner>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('alerts.index')}
                                className="flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                            >
                                Create &amp; Dispatch
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}
