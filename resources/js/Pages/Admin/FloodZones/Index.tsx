import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';

interface FloodZone {
    id: number;
    name: string;
    barangay: string;
    safe_threshold: number;
    warning_threshold: number;
    critical_threshold: number;
    risk_level: string;
    is_active: boolean;
    sensors_count: number;
}

export default function Index({ floodZones }: { floodZones: FloodZone[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this flood zone?')) {
            router.delete(route('admin.flood-zones.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="Flood Zones">
            <Head title="Flood Zones" />

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">
                    Manage flood monitoring zones across Consolacion
                </p>
                <Link href={route('admin.flood-zones.create')}>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Flood Zone
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barangay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thresholds (m)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensors</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {floodZones.map((zone) => (
                            <tr key={zone.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-900">{zone.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.barangay}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="text-green-600">{zone.safe_threshold}</span>
                                    {' / '}
                                    <span className="text-yellow-600">{zone.warning_threshold}</span>
                                    {' / '}
                                    <span className="text-red-600">{zone.critical_threshold}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.sensors_count}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={zone.is_active ? 'success' : 'secondary'}>
                                        {zone.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={route('admin.flood-zones.edit', zone.id)}>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(zone.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {floodZones.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No flood zones configured yet. Click "Add Flood Zone" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
