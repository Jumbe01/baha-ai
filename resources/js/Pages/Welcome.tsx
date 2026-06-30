import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, CloudRain, Map, Shield } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Welcome({
    auth,
    canLogin,
    canRegister,
}: {
    auth: { user?: { name: string } };
    canLogin: boolean;
    canRegister: boolean;
}) {
    return (
        <>
            <Head title="BahaAI - Flood Alert System" />

            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">BahaAI</span>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link href={route('dashboard')}>
                                <Button>Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link href={route('login')}>
                                        <Button variant="ghost">Log in</Button>
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link href={route('register')}>
                                        <Button>Register</Button>
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <main className="max-w-7xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">IoT-Based</span>
                        <span className="block text-blue-600">Flood Alert System</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                        Real-time flood monitoring, AI-powered predictions, and automated alerts
                        for the Municipality of Consolacion, Cebu.
                    </p>

                    <div className="mt-10 flex justify-center gap-4">
                        {!auth.user && canRegister && (
                            <Link href={route('register')}>
                                <Button size="lg">Get Started</Button>
                            </Link>
                        )}
                        {auth.user && (
                            <Link href={route('dashboard')}>
                                <Button size="lg">Go to Dashboard</Button>
                            </Link>
                        )}
                    </div>

                    {/* Features */}
                    <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
                        {[
                            {
                                icon: Activity,
                                title: 'Real-Time Monitoring',
                                description: 'Live water level data from IoT sensors across flood-prone areas.',
                            },
                            {
                                icon: AlertTriangle,
                                title: 'Smart Alerts',
                                description: 'Automated threshold-based alerts with SMS and email notifications.',
                            },
                            {
                                icon: CloudRain,
                                title: 'AI Predictions',
                                description: 'Machine learning forecasts for water level rise and time-to-critical.',
                            },
                            {
                                icon: Map,
                                title: 'GIS Flood Map',
                                description: 'Interactive 3D map showing flood zones, sensors, and risk levels.',
                            },
                        ].map((feature) => (
                            <div key={feature.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <feature.icon className="h-8 w-8 text-blue-600" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-200 py-8 mt-16">
                    <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
                        <p>BahaAI - IoT-Based Flood Alert System</p>
                        <p className="mt-1">Municipality of Consolacion, Cebu</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
