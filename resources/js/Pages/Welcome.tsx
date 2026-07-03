import HeroIllustration from '@/Components/Auth/HeroIllustration';
import Logo from '@/Components/Logo';
import { cn } from '@/lib/utils';
import { statusStyle, StatusLevel } from '@/lib/status';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    BrainCircuit,
    CloudRain,
    LogIn,
    MapPin,
    Radio,
    ShieldCheck,
    SlidersHorizontal,
    Siren,
} from 'lucide-react';

interface Props {
    auth: { user?: { name: string } };
    canLogin: boolean;
    canRegister: boolean;
}

const FEATURES: { icon: typeof Radio; tone: StatusLevel; title: string; desc: string }[] = [
    { icon: Radio, tone: 'info', title: 'Real-time Monitoring', desc: 'Live water-level and rainfall readings streamed from IoT sensors across flood-prone areas.' },
    { icon: BrainCircuit, tone: 'moderate', title: 'AI Flood Prediction', desc: 'Forecasts rising water levels and time-to-critical before flooding happens.' },
    { icon: Siren, tone: 'critical', title: 'Instant Alerts', desc: 'Multi-channel alerts reach residents and responders the moment risk rises.' },
    { icon: MapPin, tone: 'info', title: 'GIS Flood Map', desc: 'Interactive map of flood zones, sensor locations, and live risk overlays.' },
    { icon: CloudRain, tone: 'safe', title: 'Rainfall & Weather', desc: 'Local weather and rainfall data enrich every prediction and alert.' },
    { icon: SlidersHorizontal, tone: 'warning', title: 'Smart Actuation', desc: 'Automates pumps and drainage gates to help mitigate flooding in real time.' },
];

const STEPS = [
    { icon: Radio, title: 'Sense', desc: 'IoT sensors continuously measure water levels and rainfall across the municipality.' },
    { icon: BrainCircuit, title: 'Predict', desc: 'The AI model analyzes live and historical data to anticipate flood risk.' },
    { icon: BellRing, title: 'Alert', desc: 'Residents and authorities are notified early through in-app, SMS, and email alerts.' },
];

export default function Welcome({ auth, canLogin, canRegister }: Props) {
    const primaryHref = auth.user ? route('dashboard') : canRegister ? route('register') : route('login');
    const primaryLabel = auth.user ? 'Go to Dashboard' : 'Get Started';

    return (
        <>
            <Head title="BahaAI — IoT-Based Flood Alert System" />

            <div className="bg-white">
                {/* ============ HERO ============ */}
                <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950">
                    {/* Decorative glows */}
                    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />

                    {/* Nav */}
                    <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <Logo variant="light" size="md" />
                        <nav className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-100">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link href={route('login')} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
                                            Log in
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link href={route('register')} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Hero body */}
                    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-28 pt-10 lg:grid-cols-2 lg:pb-36 lg:pt-16">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-accent-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                                IoT-Based Flood Alert System
                            </span>
                            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                                Smart Monitoring.
                                <br />
                                Early Alerts.
                                <br />
                                <span className="text-accent-500">Safer Communities.</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
                                Real-time flood monitoring, AI-powered predictions, and instant alerts for the
                                Municipality of Consolacion, Cebu — helping communities prepare and stay safe.
                            </p>
                            <div className="mt-9 flex flex-wrap items-center gap-4">
                                <Link
                                    href={primaryHref}
                                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
                                >
                                    {primaryLabel}
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                {!auth.user && canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                                    >
                                        <LogIn className="h-5 w-5" />
                                        Log in
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Illustration card */}
                        <div className="relative">
                            <div className="absolute inset-0 -rotate-3 rounded-3xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 blur-xl" />
                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
                                <HeroIllustration className="w-full rounded-2xl" />
                                <div className="grid grid-cols-3 gap-2 p-2">
                                    <MiniStat label="Water Level" value="2.35m" tone="moderate" />
                                    <MiniStat label="AI Risk" value="High" tone="critical" />
                                    <MiniStat label="Sensors" value="Online" tone="safe" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wave divider */}
                    <svg className="absolute bottom-0 left-0 w-full text-white" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M0 40 C240 90 480 0 720 30 C960 60 1200 10 1440 40 V80 H0 Z" fill="currentColor" />
                    </svg>
                </section>

                {/* ============ FEATURES ============ */}
                <section className="mx-auto max-w-7xl px-6 py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">Everything you need to stay ahead of floods</h2>
                        <p className="mt-4 text-lg text-slate-500">From live sensor data to AI predictions and automated response — one connected platform.</p>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f) => {
                            const s = statusStyle(f.tone);
                            return (
                                <div key={f.title} className="group rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover">
                                    <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl', s.softBg)}>
                                        <f.icon className={cn('h-6 w-6', s.icon)} />
                                    </span>
                                    <h3 className="mt-5 font-display text-lg font-semibold text-navy-900">{f.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ============ HOW IT WORKS ============ */}
                <section className="bg-slate-50 py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">How BahaAI works</h2>
                            <p className="mt-4 text-lg text-slate-500">Three steps, working around the clock to protect your community.</p>
                        </div>

                        <div className="mt-14 grid gap-8 md:grid-cols-3">
                            {STEPS.map((step, i) => (
                                <div key={step.title} className="relative rounded-2xl border border-slate-200/70 bg-white p-8 text-center shadow-card">
                                    <span className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                                        {i + 1}
                                    </span>
                                    <span className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                                        <step.icon className="h-7 w-7 text-brand-600" />
                                    </span>
                                    <h3 className="mt-5 font-display text-xl font-semibold text-navy-900">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ CTA ============ */}
                <section className="mx-auto max-w-7xl px-6 py-20">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-950 px-8 py-16 text-center shadow-xl">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />
                        <ShieldCheck className="mx-auto h-12 w-12 text-accent-500" />
                        <h2 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">Ready to keep your community safe?</h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                            Join BahaAI and get early flood warnings tailored to your area.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <Link
                                href={primaryHref}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
                            >
                                {primaryLabel}
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ============ FOOTER ============ */}
                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
                        <Logo variant="dark" size="sm" />
                        <p className="text-sm text-slate-500">Municipality of Consolacion, Cebu</p>
                        <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} BahaAI</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: StatusLevel }) {
    const s = statusStyle(tone);
    return (
        <div className="rounded-xl bg-white/95 p-2.5 text-center">
            <p className="text-[10px] font-medium text-slate-400">{label}</p>
            <p className={cn('text-sm font-bold', s.text)}>{value}</p>
        </div>
    );
}
