import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, router } from '@inertiajs/react';
import { Bell, DoorOpen, Gauge, Power, Waves } from 'lucide-react';

interface Device {
    id: number;
    name: string;
    type: string;
    is_on: boolean;
    mode: string;
    status: string;
    last_activated_at: string | null;
    flood_zone: { id: number; name: string } | null;
}

interface Log {
    id: number;
    action: string;
    trigger: string;
    notes: string | null;
    logged_at: string;
    device: { id: number; name: string } | null;
    user: { id: number; name: string } | null;
}

interface Props {
    devices: Device[];
    logs: Log[];
}

const typeIcon: Record<string, typeof Power> = {
    pump: Waves,
    siren: Bell,
    floodgate: DoorOpen,
    valve: Gauge,
};

export default function Index({ devices, logs }: Props) {
    const toggle = (device: Device) => {
        router.patch(route('actuation.toggle', device.id), {}, { preserveScroll: true });
    };

    const switchMode = (device: Device, mode: string) => {
        router.patch(route('actuation.mode', device.id), { mode }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header="Smart Actuation">
            <Head title="Actuation" />

            <p className="mb-6 text-sm text-gray-500">
                Control flood-mitigation devices across monitored zones (simulated)
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {devices.map((device) => {
                    const Icon = typeIcon[device.type] ?? Power;
                    return (
                        <Card key={device.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-lg p-2 ${device.is_on ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <Icon className={`h-5 w-5 ${device.is_on ? 'text-green-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{device.name}</p>
                                            <p className="text-xs text-gray-500">{device.flood_zone?.name ?? '-'}</p>
                                        </div>
                                    </div>
                                    <Badge variant={device.is_on ? 'success' : 'secondary'}>
                                        {device.is_on ? 'ON' : 'OFF'}
                                    </Badge>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => switchMode(device, 'auto')}
                                            className={`rounded px-2 py-1 text-xs ${device.mode === 'auto' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                            Auto
                                        </button>
                                        <button
                                            onClick={() => switchMode(device, 'manual')}
                                            className={`rounded px-2 py-1 text-xs ${device.mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                            Manual
                                        </button>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={device.is_on ? 'destructive' : 'default'}
                                        onClick={() => toggle(device)}
                                        disabled={device.mode === 'auto'}
                                    >
                                        <Power className="mr-1 h-3 w-3" />
                                        {device.is_on ? 'Turn Off' : 'Turn On'}
                                    </Button>
                                </div>
                                {device.mode === 'auto' && (
                                    <p className="mt-2 text-[10px] text-gray-400">
                                        Switch to manual mode to control directly
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
                {devices.length === 0 && (
                    <div className="col-span-3 rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
                        No actuator devices configured.
                    </div>
                )}
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Power className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">{log.device?.name}</span>
                                    <span className="text-gray-500">{log.action.replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <Badge variant="outline">{log.trigger}</Badge>
                                    <span>{new Date(log.logged_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <p className="text-sm text-gray-400">No activity logged yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
