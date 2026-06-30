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

interface FloodZone {
    id: number;
    name: string;
    description: string | null;
    barangay: string;
    safe_threshold: number;
    warning_threshold: number;
    critical_threshold: number;
    coordinates: Array<{ lat: number; lng: number }>;
    is_active: boolean;
}

export default function Edit({ floodZone }: { floodZone: FloodZone }) {
    const { data, setData, put, processing, errors } = useForm({
        name: floodZone.name,
        description: floodZone.description || '',
        barangay: floodZone.barangay,
        safe_threshold: String(floodZone.safe_threshold),
        warning_threshold: String(floodZone.warning_threshold),
        critical_threshold: String(floodZone.critical_threshold),
        coordinates: floodZone.coordinates,
        is_active: floodZone.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.flood-zones.update', floodZone.id));
    };

    return (
        <AuthenticatedLayout header="Edit Flood Zone">
            <Head title="Edit Flood Zone" />

            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit: {floodZone.name}</CardTitle>
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
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is_active">Zone is active</Label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Link href={route('admin.flood-zones.index')}>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Update Flood Zone</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
