import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const BARANGAYS = [
    'Cabangahan', 'Canjulao', 'Casili', 'Consolacion Poblacion',
    'Danglag', 'Garing', 'Jugan', 'Lamac', 'Lanipga',
    'Nangka', 'Panas', 'Panoypoy', 'Pitogo', 'Sacsac',
    'Tayud', 'Tilhaong', 'Tolotolo', 'Tugbongan',
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        barangay: '',
        safe_threshold: '0',
        warning_threshold: '1.5',
        critical_threshold: '3.0',
        coordinates: [
            { lat: 10.3667, lng: 123.9567 },
            { lat: 10.3697, lng: 123.9567 },
            { lat: 10.3697, lng: 123.9597 },
            { lat: 10.3667, lng: 123.9597 },
            { lat: 10.3667, lng: 123.9567 },
        ],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.flood-zones.store'));
    };

    return (
        <AuthenticatedLayout header="Create Flood Zone">
            <Head title="Create Flood Zone" />

            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>New Flood Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Zone Name</Label>
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
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div>
                                <Label htmlFor="barangay">Barangay</Label>
                                <select
                                    id="barangay"
                                    value={data.barangay}
                                    onChange={(e) => setData('barangay', e.target.value)}
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select barangay</option>
                                    {BARANGAYS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                {errors.barangay && <p className="mt-1 text-sm text-red-600">{errors.barangay}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="safe_threshold">Safe (m)</Label>
                                    <Input
                                        id="safe_threshold"
                                        type="number"
                                        step="0.01"
                                        value={data.safe_threshold}
                                        onChange={(e) => setData('safe_threshold', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.safe_threshold && <p className="mt-1 text-sm text-red-600">{errors.safe_threshold}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="warning_threshold">Warning (m)</Label>
                                    <Input
                                        id="warning_threshold"
                                        type="number"
                                        step="0.01"
                                        value={data.warning_threshold}
                                        onChange={(e) => setData('warning_threshold', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.warning_threshold && <p className="mt-1 text-sm text-red-600">{errors.warning_threshold}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="critical_threshold">Critical (m)</Label>
                                    <Input
                                        id="critical_threshold"
                                        type="number"
                                        step="0.01"
                                        value={data.critical_threshold}
                                        onChange={(e) => setData('critical_threshold', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.critical_threshold && <p className="mt-1 text-sm text-red-600">{errors.critical_threshold}</p>}
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <Label>Zone Coordinates (GeoJSON polygon)</Label>
                                <p className="mt-1 text-xs text-gray-500">
                                    Default coordinates are set around Consolacion center. The map picker will be available in Phase 5.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Link href={route('admin.flood-zones.index')}>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Create Flood Zone</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
