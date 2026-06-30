import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfidenceGauge from '@/Components/ConfidenceGauge';
import RiskBadge from '@/Components/RiskBadge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, router, usePage } from '@inertiajs/react';
import { Clock, MapPin, TrendingUp, Zap } from 'lucide-react';
import {
    CartesianGrid,
    Line,
    LineChart,
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

const riskMap: Record<string, { level: string; label: string }> = {
    safe: { level: 'safe', label: 'Safe' },
    warning: { level: 'warning', label: 'Warning' },
    critical: { level: 'critical', label: 'Critical' },
};

export default function Index({ predictions }: { predictions: PredictionRow[] }) {
    const { auth } = usePage().props as { auth: { user: { role: string } } };
    const canGenerate = auth.user.role === 'admin' || auth.user.role === 'staff';

    const generate = () => {
        router.post(route('predictions.generate'));
    };

    return (
        <AuthenticatedLayout header="AI Predictions">
            <Head title="Predictions" />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Flood forecasts via linear regression over recent sensor readings
                </p>
                {canGenerate && (
                    <Button onClick={generate}>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Predictions
                    </Button>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {predictions.map((row) => (
                    <Card key={row.sensor.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">{row.sensor.name}</CardTitle>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                        <MapPin className="h-3 w-3" />
                                        {row.sensor.flood_zone} · {row.sensor.barangay}
                                    </div>
                                </div>
                                {row.prediction && (
                                    <RiskBadge risk={riskMap[row.prediction.risk_level] ?? riskMap.safe} />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {row.prediction ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <ConfidenceGauge value={row.prediction.confidence} />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-1 text-gray-500">
                                                    <TrendingUp className="h-3 w-3" /> Current
                                                </span>
                                                <span className="font-semibold">{row.prediction.current_level}m</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Predicted (+1h)</span>
                                                <span className="font-semibold">{row.prediction.predicted_level}m</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-1 text-gray-500">
                                                    <Clock className="h-3 w-3" /> To critical
                                                </span>
                                                <span className={`font-semibold ${row.prediction.minutes_to_critical !== null && row.prediction.minutes_to_critical <= 60 ? 'text-red-600' : ''}`}>
                                                    {row.prediction.minutes_to_critical !== null
                                                        ? `~${row.prediction.minutes_to_critical} min`
                                                        : 'Stable'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <ResponsiveContainer width="100%" height={140}>
                                        <LineChart data={row.prediction.forecast_points}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="minute"
                                                fontSize={11}
                                                tickFormatter={(v) => `+${v}m`}
                                            />
                                            <YAxis fontSize={11} unit="m" width={32} />
                                            <Tooltip
                                                formatter={(value: number) => [`${value}m`, 'Level']}
                                                labelFormatter={(v) => `+${v} min`}
                                            />
                                            <ReferenceLine
                                                y={row.sensor.critical_threshold}
                                                stroke="#ef4444"
                                                strokeDasharray="4 4"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="level"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>

                                    <p className="rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                                        {row.prediction.recommendation}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex h-32 flex-col items-center justify-center text-sm text-gray-400">
                                    <Zap className="mb-2 h-8 w-8 text-gray-300" />
                                    No prediction yet. Generate to forecast.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {predictions.length === 0 && (
                    <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
                        No active sensors available for prediction.
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
