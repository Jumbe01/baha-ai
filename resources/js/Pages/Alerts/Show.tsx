import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AlertSeverityBadge from '@/Components/AlertSeverityBadge';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Mail, MapPin, MessageSquare, Smartphone } from 'lucide-react';

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

const channelIcon: Record<string, typeof Mail> = {
    sms: Smartphone,
    email: Mail,
    push: MessageSquare,
};

export default function Show({ alert }: { alert: AlertDetail }) {
    const { auth } = usePage().props as { auth: { user: { role: string } } };
    const canManage = auth.user.role === 'admin' || auth.user.role === 'staff';

    const resolve = () => {
        if (confirm('Mark this alert as resolved?')) {
            router.patch(route('alerts.resolve', alert.id));
        }
    };

    return (
        <AuthenticatedLayout header="Alert Detail">
            <Head title={alert.title} />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={route('alerts.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">{alert.title}</h2>
                            <AlertSeverityBadge severity={alert.severity} />
                            <Badge variant={alert.status === 'active' ? 'destructive' : 'success'}>
                                {alert.status}
                            </Badge>
                        </div>
                        {alert.flood_zone && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {alert.flood_zone.name} · {alert.flood_zone.barangay}
                            </div>
                        )}
                    </div>
                </div>
                {canManage && alert.status === 'active' && (
                    <Button onClick={resolve}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Resolve
                    </Button>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-700">{alert.message}</p>
                        <dl className="grid grid-cols-2 gap-4 pt-2 text-sm">
                            <div>
                                <dt className="text-gray-400">Water Level</dt>
                                <dd className="font-medium">{alert.water_level != null ? `${alert.water_level}m` : '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-400">Sensor</dt>
                                <dd className="font-medium">{alert.sensor?.name ?? '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-400">Source</dt>
                                <dd className="font-medium capitalize">{alert.source}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-400">Triggered</dt>
                                <dd className="font-medium">{new Date(alert.created_at).toLocaleString()}</dd>
                            </div>
                            {alert.creator && (
                                <div>
                                    <dt className="text-gray-400">Created by</dt>
                                    <dd className="font-medium">{alert.creator.name}</dd>
                                </div>
                            )}
                            {alert.resolved_at && (
                                <div>
                                    <dt className="text-gray-400">Resolved</dt>
                                    <dd className="font-medium">
                                        {new Date(alert.resolved_at).toLocaleString()}
                                        {alert.resolver && ` by ${alert.resolver.name}`}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Recipients ({alert.recipients.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-64 space-y-2 overflow-y-auto">
                            {alert.recipients.map((r) => (
                                <div key={r.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium">{r.user?.name ?? 'Unknown'}</p>
                                        {r.user?.barangay && (
                                            <p className="text-xs text-gray-400">{r.user.barangay}</p>
                                        )}
                                    </div>
                                    <Badge variant={r.read_at ? 'success' : 'secondary'}>
                                        {r.read_at ? 'Read' : 'Unread'}
                                    </Badge>
                                </div>
                            ))}
                            {alert.recipients.length === 0 && (
                                <p className="text-sm text-gray-400">No recipients</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">
                        Notification Log ({alert.notification_logs.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {alert.notification_logs.map((log) => {
                            const Icon = channelIcon[log.channel] ?? MessageSquare;
                            return (
                                <div key={log.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-2 text-sm">
                                    <Icon className="h-4 w-4 text-gray-400" />
                                    <span className="w-16 font-medium uppercase text-gray-500">{log.channel}</span>
                                    <span className="flex-1">{log.user?.name ?? log.recipient}</span>
                                    <span className="text-xs text-gray-400">{log.recipient}</span>
                                    <Badge variant="success">{log.status}</Badge>
                                </div>
                            );
                        })}
                        {alert.notification_logs.length === 0 && (
                            <p className="text-sm text-gray-400">No notifications dispatched</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
