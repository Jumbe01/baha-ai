import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { StatusLevel } from '@/lib/status';
import { Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck, MapPin } from 'lucide-react';

interface NotificationRow {
    id: number;
    read_at: string | null;
    created_at: string;
    alert: {
        id: number;
        severity: string;
        title: string;
        message: string;
        flood_zone: { id: number; name: string; barangay: string } | null;
    } | null;
}

interface Props {
    notifications: Paginated<NotificationRow>;
    unreadCount: number;
}

const severityLevel = (s: string): StatusLevel =>
    s === 'critical' ? 'critical' : s === 'warning' ? 'warning' : 'info';

export default function Index({ notifications, unreadCount }: Props) {
    const markRead = (id: number) => {
        router.patch(route('notifications.read', id), {}, { preserveScroll: true });
    };

    const markAllRead = () => {
        router.patch(route('notifications.read-all'), {}, { preserveScroll: true });
    };

    const openAlert = (notification: NotificationRow) => {
        if (!notification.read_at) {
            markRead(notification.id);
        }
        if (notification.alert) {
            router.visit(route('alerts.show', notification.alert.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notifications" />

            <PageHeader
                title="Notifications"
                subtitle={
                    unreadCount > 0
                        ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                        : 'All caught up'
                }
                icon={
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                        <Bell className="h-5 w-5 text-brand-600" />
                    </span>
                }
                actions={
                    unreadCount > 0 ? (
                        <button
                            onClick={markAllRead}
                            className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <CheckCheck className="h-4 w-4" /> Mark all read
                        </button>
                    ) : undefined
                }
            />

            <SectionCard title="Recent Notifications">
                <div className="space-y-3">
                    {notifications.data.map((notification) => {
                        const level = notification.alert
                            ? severityLevel(notification.alert.severity)
                            : 'info';
                        const isUnread = !notification.read_at;
                        return (
                            <button
                                key={notification.id}
                                onClick={() => openAlert(notification)}
                                className={cn(
                                    'flex w-full items-start gap-4 rounded-xl border border-l-4 p-4 text-left transition-colors',
                                    isUnread
                                        ? cn(
                                              'border-slate-100 bg-brand-50/40 hover:bg-brand-50',
                                              level === 'critical'
                                                  ? 'border-l-red-500'
                                                  : level === 'warning'
                                                    ? 'border-l-orange-500'
                                                    : 'border-l-brand-500',
                                          )
                                        : 'border-slate-100 border-l-slate-200 bg-white hover:bg-slate-50',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                                        isUnread
                                            ? level === 'critical'
                                                ? 'bg-red-500'
                                                : level === 'warning'
                                                  ? 'bg-orange-500'
                                                  : 'bg-brand-500'
                                            : 'bg-slate-100',
                                    )}
                                >
                                    <Bell
                                        className={cn(
                                            'h-5 w-5',
                                            isUnread ? 'text-white' : 'text-slate-400',
                                        )}
                                    />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-navy-900">
                                            {notification.alert?.title ?? 'Alert'}
                                        </span>
                                        {notification.alert && (
                                            <StatusBadge level={level} label={notification.alert.severity} />
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        {notification.alert?.message}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                        {notification.alert?.flood_zone && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {notification.alert.flood_zone.name}
                                            </span>
                                        )}
                                        <span>{new Date(notification.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                {isUnread && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                                )}
                            </button>
                        );
                    })}
                    {notifications.data.length === 0 && (
                        <div className="py-12 text-center">
                            <Bell className="mx-auto h-12 w-12 text-slate-300" />
                            <p className="mt-3 text-sm text-slate-400">No notifications yet</p>
                        </div>
                    )}
                </div>

                {notifications.last_page > 1 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                        {notifications.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={cn(
                                    'rounded-lg px-3 py-1 text-sm',
                                    link.active
                                        ? 'bg-brand-600 text-white'
                                        : link.url
                                          ? 'bg-white text-slate-600 hover:bg-slate-100'
                                          : 'cursor-default text-slate-300',
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </SectionCard>

            <InfoBanner>
                Notifications are generated from real-time flood alerts. Tap any notification to view the full alert
                details and safety guidance.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
