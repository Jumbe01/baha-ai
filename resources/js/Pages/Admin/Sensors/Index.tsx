import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Plus, Pencil, Trash2 } from 'lucide-react';

interface Sensor {
    id: number;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    status: string;
    battery_level: number | null;
    last_reading_at: string | null;
    flood_zone: { id: number; name: string } | null;
    latest_reading: { water_level: number; recorded_at: string } | null;
}

export default function Index({ sensors }: { sensors: Sensor[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this sensor?')) {
            router.delete(route('admin.sensors.destroy', id));
        }
    };

    const statusVariant = (status: string) => {
        if (status === 'active') return 'success' as const;
        if (status === 'maintenance') return 'warning' as const;
        return 'secondary' as const;
    };

    return (
        <AuthenticatedLayout header="Sensors">
            <Head title="Sensors" />

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">
                    Manage IoT sensors deployed across flood zones
                </p>
                <Link href={route('admin.sensors.create')}>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sensor
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flood Zone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latest Reading</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Battery</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sensors.map((sensor) => (
                            <tr key={sensor.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-900">{sensor.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                    {sensor.type.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sensor.flood_zone?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sensor.latest_reading
                                        ? `${sensor.latest_reading.water_level}m`
                                        : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sensor.battery_level ? `${sensor.battery_level}%` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={statusVariant(sensor.status)}>
                                        {sensor.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={route('admin.sensors.edit', sensor.id)}>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sensor.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sensors.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No sensors configured yet. Click "Add Sensor" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
