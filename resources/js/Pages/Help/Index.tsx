import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { ChevronDown, HelpCircle, Mail, MessageSquare, Phone } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
    { q: 'How does BahaAI detect flooding?', a: 'BahaAI uses a network of IoT water-level sensors that stream readings in real time. When a reading crosses your barangay’s warning or critical threshold, an alert is raised automatically. A statistical model also fits recent readings to project how fast the water is rising.' },
    { q: 'How will I be notified of an alert?', a: 'In-app notifications and email are delivered for real. SMS is simulated in this deployment — messages are recorded but not transmitted — and push notifications are not yet available. Manage your channels under Profile & Settings → Notification Preferences.' },
    { q: 'Why is my area not showing sensor data?', a: 'Sensor coverage depends on deployment by your Local Government Unit. If your barangay has no nearby sensor, you will still receive area-wide alerts and weather updates.' },
    { q: 'How accurate are the predictions?', a: 'Predictions extrapolate a straight-line trend from the last two hours of readings, so they assume the water keeps rising at its current rate. The confidence score reflects how closely recent readings fit that line — not how likely the forecast is to come true. Always treat predictions as guidance and follow official advisories from PAGASA and your local DRRMO.' },
    { q: 'How do I change my monitored location?', a: 'Use "Change Location" in the sidebar, or go to Profile & Settings → Update Location, to set the area you want to monitor.' },
];

const CONTACTS = [
    { icon: Phone, label: 'Emergency Hotline', value: '911' },
    { icon: Mail, label: 'Email Support', value: 'support@bahaai.example' },
    { icon: MessageSquare, label: 'LGU DRRMO', value: '(032) 000-0000' },
];

export default function HelpIndex() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <AuthenticatedLayout>
            <Head title="Help & Support" />

            <PageHeader
                title="Help & Support"
                subtitle="Guides, FAQs, and ways to reach the BahaAI team."
                icon={<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50"><HelpCircle className="h-6 w-6 text-brand-600" /></span>}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <SectionCard title="Frequently Asked Questions" className="lg:col-span-2">
                    <div className="space-y-2">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="rounded-xl border border-slate-200">
                                <button
                                    onClick={() => setOpen(open === i ? null : i)}
                                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                                >
                                    <span className="text-sm font-semibold text-navy-900">{faq.q}</span>
                                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', open === i && 'rotate-180')} />
                                </button>
                                {open === i && <p className="px-4 pb-4 text-sm text-slate-600">{faq.a}</p>}
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Contact Us">
                    <div className="space-y-2">
                        {CONTACTS.map((c) => (
                            <div key={c.label} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                                    <c.icon className="h-4 w-4 text-brand-600" />
                                </span>
                                <div>
                                    <p className="text-xs text-slate-500">{c.label}</p>
                                    <p className="text-sm font-semibold text-navy-900">{c.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            <InfoBanner>
                For life-threatening emergencies, always call your local emergency hotline immediately.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}
