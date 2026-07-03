import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { Bell, Cpu, DoorOpen, Gauge, Hand, Power, Waves, Zap } from 'lucide-react';
import { useMemo } from 'react';

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

const typeIcon: Record<string, typeof Power> = {
    pump: Waves,
    siren: Bell,
    floodgate: DoorOpen,
    valve: Gauge,
};

export default function ActuationIndex({ devices, logs }: { devices: Device[]; logs: Log[] }) {
    const stats = useMemo(() => {
        const on = devices.filter((d) => d.is_on).length;
        const auto = devices.filter((d) => d.mode === 'auto').length;
        const pumps = devices.filter((d) => d.type === 'pump' && d.is_on).length;
        const gates = devices.filter((d) => d.type === 'floodgate' && d.is_on).length;
        return { on, auto, pumps, gates, total: devices.length };
    }, [devices]);

    const toggle = (d: Device) => router.patch(route('actuation.toggle', d.id), {}, { preserveScroll: true });
    const switchMode = (d: Device, mode: string) => router.patch(route('actuation.mode', d.id), { mode }, { preserveScroll: true });

    return (
        <AuthenticatedLayout>
            <Head title="Smart Actuation" />

            <PageHeader
                title="Smart Actuation"
                subtitle="Monitor and control automatic pumps, drainage gates, and flood mitigation devices."
                actions={
                    <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-emerald-600">Operational</span>
                    </span>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Active Devices" value={`${stats.on} / ${stats.total}`} icon={Power} tone={stats.on > 0 ? 'safe' : 'neutral'} status="Online" />
                <StatCard label="Pumps Running" value={stats.pumps} icon={Waves} tone="info" status="Live" />
                <StatCard label="Drainage Gates Open" value={stats.gates} icon={DoorOpen} tone="moderate" status="Live" />
                <StatCard label="Devices in Auto" value={`${stats.auto} / ${stats.total}`} icon={Cpu} tone="info" status="Auto Mode" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <SectionCard title="Device Status" className="lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {devices.map((device) => {
                            const Icon = typeIcon[device.type] ?? Power;
                            return (
                                <div key={device.id} className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', device.is_on ? 'bg-emerald-50' : 'bg-slate-100')}>
                                                <Icon className={cn('h-5 w-5', device.is_on ? 'text-emerald-500' : 'text-slate-400')} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-navy-900">{device.name}</p>
                                                <p className="text-xs text-slate-500">{device.flood_zone?.name ?? '—'}</p>
                                            </div>
                                        </div>
                                        <StatusBadge level={device.is_on ? 'safe' : 'neutral'} label={device.is_on ? 'Running' : 'Standby'} />
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-2">
                                        <div className="flex rounded-lg bg-slate-100 p-0.5">
                                            {['auto', 'manual'].map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => switchMode(device, m)}
                                                    className={cn('rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors', device.mode === m ? 'bg-brand-600 text-white' : 'text-slate-600')}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => toggle(device)}
                                            disabled={device.mode === 'auto'}
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                                device.is_on ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                                            )}
                                        >
                                            <Power className="h-3.5 w-3.5" />
                                            {device.is_on ? 'Stop' : 'Start'}
                                        </button>
                                    </div>
                                    {device.mode === 'auto' && (
                                        <p className="mt-2 text-[11px] text-slate-400">Switch to manual mode to control directly.</p>
                                    )}
                                </div>
                            );
                        })}
                        {devices.length === 0 && (
                            <p className="col-span-2 py-10 text-center text-sm text-slate-400">No actuator devices configured.</p>
                        )}
                    </div>
                </SectionCard>

                <div className="space-y-6">
                    <SectionCard title="Control Mode" icon={<Cpu className="h-5 w-5 text-brand-600" />}>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                <Cpu className="mt-0.5 h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-semibold text-navy-900">Automatic Mode</p>
                                    <p className="text-xs text-slate-500">Devices controlled by sensor data and AI predictions.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                                <Hand className="mt-0.5 h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-semibold text-navy-900">Manual Mode</p>
                                    <p className="text-xs text-slate-500">Control pumps and gates regardless of automatic rules.</p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Actuation Activity Log">
                        <div className="space-y-2">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5">
                                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-navy-900">
                                            {log.device?.name} <span className="font-normal text-slate-500">{log.action.replace('_', ' ')}</span>
                                        </p>
                                        <p className="text-xs text-slate-400">{new Date(log.logged_at).toLocaleString()}</p>
                                    </div>
                                    <StatusBadge level={log.trigger === 'auto' ? 'info' : 'neutral'} label={log.trigger} />
                                </div>
                            ))}
                            {logs.length === 0 && <p className="text-sm text-slate-400">No activity logged yet.</p>}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <InfoBanner>
                Smart Actuation uses real-time sensor data and AI predictions to minimize flooding and optimize device operations.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
