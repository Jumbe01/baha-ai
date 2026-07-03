import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InfoBanner from '@/Components/InfoBanner';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { riskToStatus, statusStyle } from '@/lib/status';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, BrainCircuit, Clock, Droplets, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface ForecastPoint {
    minute: number;
    level: number;
    predicted: boolean;
}

interface Prediction {
    id: number;
    current_level: number;
    rate_of_rise: number;
    predicted_level: number;
    minutes_to_critical: number | null;
    confidence: number;
    risk_level: string;
    recommendation: string;
    forecast_points: ForecastPoint[];
    generated_at: string;
}

interface PredictionRow {
    sensor: {
        id: number;
        name: string;
        flood_zone: string;
        barangay: string;
        critical_threshold: number;
    };
    prediction: Prediction | null;
}

export default function PredictionsIndex({ predictions }: { predictions: PredictionRow[] }) {
    const { auth } = usePage().props as { auth: { user: { role: string } } };
    const canGenerate = auth.user.role === 'admin' || auth.user.role === 'staff';

    const withPrediction = predictions.filter((p) => p.prediction);
    const riskRank: Record<string, number> = { critical: 3, warning: 2, safe: 1 };
    const sorted = [...withPrediction].sort(
        (a, b) => (riskRank[b.prediction!.risk_level] ?? 0) - (riskRank[a.prediction!.risk_level] ?? 0),
    );
    const [selectedId, setSelectedId] = useState<number | null>(sorted[0]?.sensor.id ?? null);
    const primary = withPrediction.find((p) => p.sensor.id === selectedId) ?? sorted[0] ?? null;

    const generate = () => router.post(route('predictions.generate'));

    return (
        <AuthenticatedLayout>
            <Head title="AI Flood Prediction" />

            <PageHeader
                title="AI-Based Flood Prediction"
                subtitle="AI model analyzes real-time data to predict future water levels."
                icon={
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                        <BrainCircuit className="h-6 w-6 text-brand-600" />
                    </span>
                }
                actions={
                    <>
                        {withPrediction.length > 0 && (
                            <select
                                value={selectedId ?? ''}
                                onChange={(e) => setSelectedId(Number(e.target.value))}
                                className="h-10 rounded-xl border-slate-300 text-sm text-slate-700 focus:border-brand-500 focus:ring-brand-500"
                            >
                                {withPrediction.map((p) => (
                                    <option key={p.sensor.id} value={p.sensor.id}>{p.sensor.name}</option>
                                ))}
                            </select>
                        )}
                        {canGenerate && (
                            <button onClick={generate} className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                <RefreshCw className="h-4 w-4" /> Refresh Prediction
                            </button>
                        )}
                    </>
                }
            />

            {primary && primary.prediction ? (
                <PredictionDetail row={primary} others={sorted} onSelect={setSelectedId} />
            ) : (
                <SectionCard>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <BrainCircuit className="mb-3 h-12 w-12 text-slate-300" />
                        <p className="text-slate-500">No predictions generated yet.</p>
                        {canGenerate && (
                            <button onClick={generate} className="mt-4 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                                Generate Predictions
                            </button>
                        )}
                    </div>
                </SectionCard>
            )}

            <InfoBanner>
                Predictions are generated using AI models and may vary from actual conditions. Always follow safety guidelines and official advisories.
            </InfoBanner>
        </AuthenticatedLayout>
    );
}

function PredictionDetail({
    row,
    others,
    onSelect,
}: {
    row: PredictionRow;
    others: PredictionRow[];
    onSelect: (id: number) => void;
}) {
    const p = row.prediction!;
    const tone = riskToStatus(p.risk_level);
    const crit = Number(row.sensor.critical_threshold);
    // Laravel decimal casts serialize as strings over JSON — coerce before numeric ops.
    const currentLevel = Number(p.current_level);
    const predictedLevel = Number(p.predicted_level);
    const rateOfRise = Number(p.rate_of_rise);

    const chartData = useMemo(
        () => (p.forecast_points ?? []).map((f) => ({ label: f.minute === 0 ? 'Now' : `+${f.minute}m`, level: Number(f.level) })),
        [p.forecast_points],
    );
    const peak = Math.max(...chartData.map((f) => f.level), predictedLevel);
    const confRaw = Number(p.confidence);
    const confidence = confRaw > 1 ? Math.round(confRaw) : Math.round(confRaw * 100);

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Current Water Level" value={currentLevel.toFixed(2)} unit="m" icon={Droplets} tone="info" meta={row.sensor.name} />
                <StatCard label="Predicted Risk Level" value={risklabel(p.risk_level)} icon={AlertTriangle} tone={tone} status="in 1 hour" />
                <StatCard label="Predicted Water Level" value={predictedLevel.toFixed(2)} unit="m" icon={TrendingUp} tone={tone} status="in 1 hour" />
                <StatCard label="AI Confidence" value={confidence} unit="%" icon={ShieldCheck} tone="info" status={confidence >= 75 ? 'High' : confidence >= 50 ? 'Moderate' : 'Low'} />
                <StatCard
                    label="Time to Critical"
                    value={p.minutes_to_critical != null ? `~${p.minutes_to_critical}` : 'Stable'}
                    unit={p.minutes_to_critical != null ? 'min' : undefined}
                    icon={Clock}
                    tone={p.minutes_to_critical != null && p.minutes_to_critical <= 60 ? 'critical' : 'safe'}
                />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <SectionCard title="Water Level Forecast" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                            <XAxis dataKey="label" fontSize={11} stroke="#94a3b8" />
                            <YAxis fontSize={11} unit="m" width={38} stroke="#94a3b8" domain={[0, Math.max(peak + 0.5, crit + 0.5)]} />
                            <Tooltip formatter={(v) => [`${Number(v).toFixed(2)} m`, 'Level']} />
                            <ReferenceLine y={crit} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Critical ${crit}m`, position: 'right', fontSize: 10, fill: '#ef4444' }} />
                            <Area type="monotone" dataKey="level" stroke="#2563eb" strokeWidth={2.5} fill="url(#fc)" dot={{ r: 3, fill: '#2563eb' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-slate-600">
                        <span className="font-semibold text-brand-700">AI Analysis:</span>{' '}
                        Rate of rise {rateOfRise.toFixed(2)} m/h · generated {new Date(p.generated_at).toLocaleString()}.
                    </div>
                </SectionCard>

                <div className="space-y-6">
                    <SectionCard title="AI Recommendation" icon={<BrainCircuit className="h-5 w-5 text-brand-600" />}>
                        <div className={cn('rounded-xl p-4', statusStyle(tone).softBg)}>
                            <div className="flex items-start gap-3">
                                <AlertTriangle className={cn('mt-0.5 h-6 w-6 shrink-0', statusStyle(tone).icon)} />
                                <p className="text-sm text-slate-700">{p.recommendation}</p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Recent Predictions">
                        <div className="space-y-2">
                            {others.slice(0, 6).map((o) => {
                                const t = riskToStatus(o.prediction!.risk_level);
                                return (
                                    <button
                                        key={o.sensor.id}
                                        onClick={() => onSelect(o.sensor.id)}
                                        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={cn('h-2 w-2 rounded-full', statusStyle(t).icon.replace('text-', 'bg-'))} />
                                            <span className="text-sm font-medium text-navy-900">{o.sensor.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-slate-700">{Number(o.prediction!.predicted_level).toFixed(2)}m</span>
                                            <StatusBadge level={t} label={risklabel(o.prediction!.risk_level)} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </>
    );
}

function risklabel(risk: string): string {
    switch (risk) {
        case 'critical': return 'High Risk';
        case 'warning': return 'Warning';
        default: return 'Normal';
    }
}
