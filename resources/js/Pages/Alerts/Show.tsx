import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { StatusLevel } from '@/lib/status';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle, Droplet, Mail, MapPin, MessageSquare, Smartphone } from 'lucide-react';

interface NotificationLog {
    id: number;
    channel: string;
    recipient: string;
    status: string;
    sent_at: string | null;
    user: { id: number; name: string } | null;
}

interface Recipient {
    id: number;
    read_at: string | null;
    user: { id: number; name: string; barangay: string | null } | null;
}

interface AlertDetail {
    id: number;
    severity: string;
    title: string;
    message: string;
    status: string;
    source: string;
    water_level: number | null;
    created_at: string;
    resolved_at: string | null;
    flood_zone: { id: number; name: string; barangay: string } | null;
    sensor: { id: number; name: string } | null;
    creator: { id: number; name: string } | null;
    resolver: { id: number; name: string } | null;
    recipients: Recipient[];
    notification_logs: NotificationLog[];
}

const channelIcon: Record<string, typeof Mail> = { sms: Smartphone, email: Mail, push: MessageSquare };
const severityLevel = (s: string): StatusLevel => (s === 'critical' ? 'critical' : s === 'warning' ? 'warning' : 'info');

export default function Show({ alert }: { alert: AlertDetail }) {
    const { auth } = usePage().props as { auth: { user: { role: string } } };
    const canManage = auth.user.role === 'admin' || auth.user.role === 'staff';
    const level = severityLevel(alert.severity);

    const resolve = () => {
        if (confirm('Mark this alert as resolved?')) {
            router.patch(route('alerts.resolve', alert.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={alert.title} />

            <PageHeader
                title={alert.title}
                subtitle={alert.flood_zone ? `${alert.flood_zone.name} · ${alert.flood_zone.barangay}` : 'System-wide alert'}
                icon={
                    <Link href={route('alerts.index')} className="mt-1 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                }
                actions={
                    <>
                        <StatusBadge level={level} label={alert.severity} />
                        <StatusBadge level={alert.status === 'active' ? 'critical' : 'safe'} label={alert.status} />
                        {canManage && alert.status === 'active' && (
                            <button onClick={resolve} className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
                                <CheckCircle className="h-4 w-4" /> Resolve
                            </button>
                        )}
                    </>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <SectionCard title="Alert Details" icon={<AlertTriangle className={cn('h-5 w-5', level === 'critical' ? 'text-red-500' : level === 'warning' ? 'text-orange-500' : 'text-brand-500')} />}>
                        <p className="text-sm leading-relaxed text-slate-700">{alert.message}</p>
                        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                            <Meta icon={Droplet} label="Water Level" value={alert.water_level != null ? `${alert.water_level} m` : '—'} />
                            <Meta icon={MapPin} label="Sensor" value={alert.sensor?.name ?? '—'} />
                            <Meta label="Source" value={alert.source} className="capitalize" />
                            <Meta label="Triggered" value={new Date(alert.created_at).toLocaleString()} />
                            {alert.creator && <Meta label="Created by" value={alert.creator.name} />}
                            {alert.resolved_at && <Meta label="Resolved" value={`${new Date(alert.resolved_at).toLocaleString()}${alert.resolver ? ` · ${alert.resolver.name}` : ''}`} />}
                        </dl>
                    </SectionCard>

                    <SectionCard title={`Notification Log (${alert.notification_logs.length})`}>
                        <div className="space-y-2">
                            {alert.notification_logs.map((log) => {
                                const Icon = channelIcon[log.channel] ?? MessageSquare;
                                return (
                                    <div key={log.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 text-sm">
                                        <Icon className="h-4 w-4 text-slate-400" />
                                        <span className="w-14 font-semibold uppercase text-slate-500">{log.channel}</span>
                                        <span className="flex-1 truncate text-navy-900">{log.user?.name ?? log.recipient}</span>
                                        <StatusBadge level="safe" label={log.status} />
                                    </div>
                                );
                            })}
                            {alert.notification_logs.length === 0 && <p className="text-sm text-slate-400">No notifications dispatched.</p>}
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-6">
                    <SectionCard title="Alert Channels">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: MessageSquare, label: 'In-App' },
                                { icon: Smartphone, label: 'SMS' },
                                { icon: Smartphone, label: 'Push' },
                                { icon: Mail, label: 'Email' },
                            ].map((c, i) => (
                                <div key={i} className="rounded-xl border border-slate-200 p-3 text-center">
                                    <c.icon className="mx-auto h-5 w-5 text-brand-500" />
                                    <p className="mt-1 text-sm font-semibold text-navy-900">{c.label}</p>
                                    <p className="text-xs text-emerald-600">Enabled</p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title={`Recipients (${alert.recipients.length})`}>
                        <div className="max-h-72 space-y-2 overflow-y-auto">
                            {alert.recipients.map((r) => (
                                <div key={r.id} className="flex items-center justify-between text-sm">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-navy-900">{r.user?.name ?? 'Unknown'}</p>
                                        {r.user?.barangay && <p className="text-xs text-slate-400">{r.user.barangay}</p>}
                                    </div>
                                    <StatusBadge level={r.read_at ? 'safe' : 'neutral'} label={r.read_at ? 'Read' : 'Unread'} />
                                </div>
                            ))}
                            {alert.recipients.length === 0 && <p className="text-sm text-slate-400">No recipients.</p>}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <InfoBanner>
                Alerts are based on real-time data from IoT sensors, weather updates, and AI predictions. Always follow the safety guidelines from your local authorities.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}

function Meta({ icon: Icon, label, value, className }: { icon?: typeof Mail; label: string; value: string; className?: string }) {
    return (
        <div>
            <dt className="flex items-center gap-1.5 text-xs text-slate-400">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
            </dt>
            <dd className={cn('mt-0.5 font-semibold text-navy-900', className)}>{value}</dd>
        </div>
    );
}
