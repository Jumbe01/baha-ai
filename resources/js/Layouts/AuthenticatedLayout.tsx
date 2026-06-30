import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Badge } from '@/Components/ui/badge';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CloudRain,
    Gauge,
    LayoutDashboard,
    Map,
    Menu,
    Settings,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage().props as { auth: { user: { name: string; email: string; role: string } } };
    const user = auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = getNavigation(user.role);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">BahaAI</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    item.active
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'staff' ? 'default' : 'secondary'} className="mt-0.5">
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {header && (
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-gray-900">{header}</h1>
                        </div>
                    )}

                    {!header && <div className="flex-1" />}

                    <div className="flex items-center gap-3">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    {user.name}
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}

function getNavigation(role: string) {
    const items = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            active: route().current('dashboard'),
            roles: ['admin', 'staff', 'resident'],
        },
        {
            name: 'Water Levels',
            href: route('water-levels.index'),
            icon: Gauge,
            active: route().current('water-levels.*'),
            roles: ['admin', 'staff', 'resident'],
        },
        {
            name: 'Flood Zones',
            href: route('admin.flood-zones.index'),
            icon: Map,
            active: route().current('admin.flood-zones.*'),
            roles: ['admin'],
        },
        {
            name: 'Sensors',
            href: route('admin.sensors.index'),
            icon: Activity,
            active: route().current('admin.sensors.*'),
            roles: ['admin'],
        },
    ];

    return items.filter((item) => item.roles.includes(role));
}
