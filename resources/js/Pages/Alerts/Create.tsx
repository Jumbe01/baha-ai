import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';
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

    return (
        <AuthenticatedLayout header="Create Alert">
            <Head title="Create Alert" />

            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Manual Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label htmlFor="flood_zone_id">Flood Zone</Label>
                                <select
                                    id="flood_zone_id"
                                    value={data.flood_zone_id}
                                    onChange={(e) => setData('flood_zone_id', e.target.value)}
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select flood zone</option>
                                    {floodZones.map((zone) => (
                                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                                    ))}
                                </select>
                                {errors.flood_zone_id && <p className="mt-1 text-sm text-red-600">{errors.flood_zone_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="severity">Severity</Label>
                                <select
                                    id="severity"
                                    value={data.severity}
                                    onChange={(e) => setData('severity', e.target.value)}
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="warning">Warning</option>
                                    <option value="critical">Critical</option>
                                </select>
                                {errors.severity && <p className="mt-1 text-sm text-red-600">{errors.severity}</p>}
                            </div>

                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    required
                                />
                                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                                Creating this alert will immediately dispatch notifications to all residents
                                in the affected barangay and all staff members.
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Link href={route('alerts.index')}>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Create & Dispatch</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
