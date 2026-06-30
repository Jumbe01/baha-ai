import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, usePage } from '@inertiajs/react';
import { Activity, AlertTriangle, CloudRain, Gauge } from 'lucide-react';

export default function Dashboard() {
    const { auth } = usePage().props as { auth: { user: { name: string; role: string } } };

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Welcome back, {auth.user.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    BahaAI Flood Monitoring System - Municipality of Consolacion, Cebu
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
                        <Activity className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500">No sensors configured yet</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500">All clear</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Water Level</CardTitle>
                        <Gauge className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-gray-500">No readings available</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weather</CardTitle>
                        <CloudRain className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-gray-500">Weather data pending</p>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
