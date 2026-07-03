import Logo from '@/Components/Logo';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bell,
    BrainCircuit,
    CloudRain,
    Database,
    HelpCircle,
    Home,
    Info,
    LayoutDashboard,
    type LucideIcon,
    MapPin,
    Menu,
    Navigation,
    Radio,
    Settings,
    SlidersHorizontal,
    Users,
    X,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
    active: boolean;
    roles: string[];
    badge?: number;
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrator',
    staff: 'LGU / Officer',
    resident: 'Citizen / Resident',
};

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage().props as {
        auth: { user: { name: string; email: string; role: string; location?: string } };
        unreadNotifications?: number;
    };
    const user = page.auth.user;
    const unread = page.unreadNotifications ?? 0;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { primary, admin } = getNavigation(user.role, unread);
    const roleLabel = ROLE_LABELS[user.role] ?? user.role;
    const location = user.location ?? 'Set your location';

    const now = new Date();

    return (
        <div className="min-h-screen bg-slate-50">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 transition-transform duration-200 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* Brand */}
                <div className="relative px-6 pb-4 pt-6">
                    <Link href={route('dashboard')} className="block">
                        <Logo variant="light" stacked showTagline />
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute right-4 top-4 p-1 text-slate-400 hover:text-white lg:hidden"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="sidebar-scroll flex-1 overflow-y-auto px-4 py-2">
                    <div className="space-y-1">
                        {primary.map((item) => (
                            <NavRow key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
                        ))}
                    </div>

                    {admin.length > 0 && (
                        <div className="mt-6">
                            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Administration
                            </p>
                            <div className="space-y-1">
                                {admin.map((item) => (
                                    <NavRow key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                {/* User card + location */}
                <div className="border-t border-white/10 p-4">
                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                            <p className="truncate text-xs text-slate-400">{roleLabel}</p>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Online
                        </span>
                    </Link>

                    <div className="mt-3 flex items-start gap-2 px-1">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-slate-300">{location}</p>
                            <Link
                                href={route('location.select')}
                                className="text-xs font-medium text-accent-500 hover:text-accent-400"
                            >
                                Change Location
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="lg:pl-72">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1 text-slate-500 hover:text-slate-900 lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {header ? (
                        <div className="flex-1">
                            <h1 className="font-display text-lg font-semibold text-navy-900">{header}</h1>
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}

                    <div className="flex items-center gap-4">
                        <Link
                            href={route('notifications.index')}
                            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            {unread > 0 && (
                                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                    {unread > 99 ? '99+' : unread}
                                </span>
                            )}
                        </Link>
                        <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 text-right sm:flex">
                            <div>
                                <p className="text-xs font-medium text-slate-900">
                                    {now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}

function NavRow({ item, onClick }: { item: NavItem; onClick: () => void }) {
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                item.active
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
        >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.name}</span>
            {item.badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                </span>
            ) : null}
        </Link>
    );
}

function getNavigation(role: string, unread: number) {
    const all: NavItem[] = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard'), roles: ['admin', 'staff', 'resident'] },
        { name: 'Real-time Monitoring', href: route('water-levels.index'), icon: Radio, active: route().current('water-levels.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'AI Flood Prediction', href: route('predictions.index'), icon: BrainCircuit, active: route().current('predictions.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'Alerts & Notifications', href: route('alerts.index'), icon: Bell, active: route().current('alerts.*'), roles: ['admin', 'staff', 'resident'], badge: unread },
        { name: 'Rainfall & Weather', href: route('weather.index'), icon: CloudRain, active: route().current('weather.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'Flood Map', href: route('map.index'), icon: MapPin, active: route().current('map.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'Evacuation Centers', href: route('evacuation.index'), icon: Home, active: route().current('evacuation.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'Reports & Analytics', href: route('analytics.index'), icon: BarChart3, active: route().current('analytics.*'), roles: ['admin', 'staff'] },
        { name: 'Historical Data', href: route('historical.index'), icon: Database, active: route().current('historical.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'GPS Flood Alerts', href: route('gps-alerts.index'), icon: Navigation, active: route().current('gps-alerts.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'Smart Actuation', href: route('actuation.index'), icon: SlidersHorizontal, active: route().current('actuation.*'), roles: ['admin', 'staff'] },
        { name: 'Settings', href: route('profile.edit'), icon: Settings, active: route().current('profile.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'Help & Support', href: route('help.index'), icon: HelpCircle, active: route().current('help.*'), roles: ['admin', 'staff', 'resident'] },
        { name: 'About BahaAI', href: route('about.index'), icon: Info, active: route().current('about.*'), roles: ['admin', 'staff', 'resident'] },
    ];

    const adminItems: NavItem[] = [
        { name: 'Flood Zones', href: route('admin.flood-zones.index'), icon: MapPin, active: route().current('admin.flood-zones.*'), roles: ['admin'] },
        { name: 'Sensors', href: route('admin.sensors.index'), icon: Activity, active: route().current('admin.sensors.*'), roles: ['admin'] },
        { name: 'Users', href: route('admin.users.index'), icon: Users, active: route().current('admin.users.*'), roles: ['admin'] },
    ];

    return {
        primary: all.filter((i) => i.roles.includes(role)),
        admin: adminItems.filter((i) => i.roles.includes(role)),
    };
}
