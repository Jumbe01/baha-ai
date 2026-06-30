import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AlertSeverityBadge from '@/Components/AlertSeverityBadge';
import { Button } from '@/Components/ui/button';
import { Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
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
        <AuthenticatedLayout header="Notifications">
            <Head title="Notifications" />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllRead}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all read
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                {notifications.data.map((notification) => (
                    <button
                        key={notification.id}
                        onClick={() => openAlert(notification)}
                        className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                            notification.read_at
                                ? 'border-gray-200 bg-white'
                                : 'border-blue-200 bg-blue-50'
                        }`}
                    >
                        <div className={`mt-0.5 rounded-full p-2 ${notification.read_at ? 'bg-gray-100' : 'bg-blue-100'}`}>
                            <Bell className={`h-4 w-4 ${notification.read_at ? 'text-gray-400' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                    {notification.alert?.title ?? 'Alert'}
                                </span>
                                {notification.alert && <AlertSeverityBadge severity={notification.alert.severity} />}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{notification.alert?.message}</p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                                {notification.alert?.flood_zone && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {notification.alert.flood_zone.name}
                                    </span>
                                )}
                                <span>{new Date(notification.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        {!notification.read_at && (
                            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                        )}
                    </button>
                ))}
                {notifications.data.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <Bell className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-3 text-sm text-gray-500">No notifications yet</p>
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
                            className={`rounded px-3 py-1 text-sm ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : link.url
                                      ? 'bg-white text-gray-600 hover:bg-gray-100'
                                      : 'cursor-default text-gray-300'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
