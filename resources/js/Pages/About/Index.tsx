import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import Logo from '@/Components/Logo';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import { cn } from '@/lib/utils';
import { statusStyle } from '@/lib/status';
import { Head } from '@inertiajs/react';
import { BrainCircuit, CloudRain, Info, Radio, Siren } from 'lucide-react';

const FEATURES = [
    { icon: Radio, tone: 'info' as const, title: 'Real-time Monitoring', desc: 'IoT water-level and rainfall sensors stream live readings from across the community.' },
    { icon: BrainCircuit, tone: 'moderate' as const, title: 'AI Flood Prediction', desc: 'A predictive model forecasts rising water levels before flooding happens.' },
    { icon: Siren, tone: 'critical' as const, title: 'Instant Alerts', desc: 'Multi-channel alerts (in-app, SMS, push, email) reach residents the moment risk rises.' },
    { icon: CloudRain, tone: 'safe' as const, title: 'Weather Integration', desc: 'Rainfall and weather data enrich predictions and keep communities informed.' },
];

export default function AboutIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="About BahaAI" />

            <PageHeader
                title="About BahaAI"
                subtitle="Learn more about the IoT-Based Flood Alert System."
                icon={<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50"><Info className="h-6 w-6 text-brand-600" /></span>}
            />

            <SectionCard>
                <div className="flex flex-col items-center gap-6 py-6 text-center">
                    <Logo variant="dark" stacked showTagline />
                    <p className="max-w-2xl text-slate-600">
                        BahaAI is an IoT-based flood alert system built to help communities prepare for and respond to
                        flooding. It combines real-time sensor monitoring, AI-driven prediction, and instant multi-channel
                        alerts so that residents, responders, and local authorities can act early and stay safe.
                    </p>
                </div>
            </SectionCard>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {FEATURES.map((f) => {
                    const s = statusStyle(f.tone);
                    return (
                        <SectionCard key={f.title}>
                            <div className="flex items-start gap-4">
                                <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', s.softBg)}>
                                    <f.icon className={cn('h-6 w-6', s.icon)} />
                                </span>
                                <div>
                                    <h3 className="font-display text-base font-semibold text-navy-900">{f.title}</h3>
                                    <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                                </div>
                            </div>
                        </SectionCard>
                    );
                })}
            </div>

            <SectionCard title="System Information" className="mt-6">
                <dl className="grid gap-4 sm:grid-cols-3">
                    <Meta label="Version" value="BahaAI v1.0" />
                    <Meta label="Coverage" value="Municipality of Consolacion, Cebu" />
                    <Meta label="Data Sources" value="IoT Sensors · Weather API" />
                </dl>
            </SectionCard>

            <InfoBanner>
                BahaAI is a decision-support tool. Always follow official advisories from your local disaster response authorities.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}

function Meta({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-navy-900">{value}</dd>
        </div>
    );
}
