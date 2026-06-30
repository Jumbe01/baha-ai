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
        name: '',
        type: 'ultrasonic',
        latitude: '10.3667',
        longitude: '123.9567',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.sensors.store'));
    };

    return (
        <AuthenticatedLayout header="Add Sensor">
            <Head title="Add Sensor" />

            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>New Sensor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Sensor Name</Label>
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
                                <Label htmlFor="flood_zone_id">Flood Zone</Label>
                                <select
                                    id="flood_zone_id"
                                    value={data.flood_zone_id}
                                    onChange={(e) => setData('flood_zone_id', e.target.value)}
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <Label htmlFor="type">Sensor Type</Label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="ultrasonic">Ultrasonic</option>
                                    <option value="rain_gauge">Rain Gauge</option>
                                    <option value="pressure">Pressure</option>
                                </select>
                                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="0.000001"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="0.000001"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>}
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <p className="text-xs text-gray-500">
                                    Default coordinates are set to Consolacion center. The interactive map picker will be available in Phase 5.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Link href={route('admin.sensors.index')}>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Create Sensor</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
