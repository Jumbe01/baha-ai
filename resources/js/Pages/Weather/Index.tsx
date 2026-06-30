import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head } from '@inertiajs/react';
import { Cloud, CloudRain, Droplets, Thermometer, Wind } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    ComposedChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface ForecastEntry {
    time: string;
    temperature: number | null;
    rainfall: number;
    condition: string | null;
    icon: string | null;
}

interface Weather {
    location: string;
    temperature: number | null;
    feels_like: number | null;
    humidity: number | null;
    rainfall: number;
    wind_speed: number | null;
    condition: string | null;
    description: string | null;
    icon: string | null;
    forecast: ForecastEntry[];
    fetched_at: string;
}

interface Props {
    weather: Weather;
    usingSimulatedData: boolean;
}

export default function Index({ weather, usingSimulatedData }: Props) {
    const forecastData = (weather.forecast ?? []).map((f) => ({
        time: f.time ? new Date(f.time).toLocaleTimeString([], { hour: '2-digit' }) : '',
        temperature: f.temperature,
        rainfall: f.rainfall,
    }));

    return (
        <AuthenticatedLayout header="Weather">
            <Head title="Weather" />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Current conditions and forecast for {weather.location}, Cebu
                </p>
                {usingSimulatedData && (
                    <Badge variant="warning">Simulated Data</Badge>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="md:col-span-2">
                    <CardContent className="flex items-center gap-6 p-6">
                        <div className="flex flex-col items-center">
                            <Cloud className="h-16 w-16 text-blue-400" />
                            <span className="mt-1 text-sm capitalize text-gray-500">{weather.description}</span>
                        </div>
                        <div>
                            <div className="text-5xl font-bold">{weather.temperature ?? '--'}°C</div>
                            <p className="text-sm text-gray-500">
                                Feels like {weather.feels_like ?? '--'}°C
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Droplets className="h-8 w-8 text-cyan-400" />
                        <div>
                            <p className="text-xs text-gray-400">Humidity</p>
                            <p className="text-xl font-bold">{weather.humidity ?? '--'}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <CloudRain className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-xs text-gray-400">Rainfall</p>
                            <p className="text-xl font-bold">{weather.rainfall}mm</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Wind className="h-8 w-8 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-400">Wind Speed</p>
                            <p className="text-xl font-bold">{weather.wind_speed ?? '--'} m/s</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Thermometer className="h-8 w-8 text-orange-400" />
                        <div>
                            <p className="text-xs text-gray-400">Condition</p>
                            <p className="text-xl font-bold">{weather.condition ?? '--'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">24-Hour Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                    {forecastData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" fontSize={12} />
                                <YAxis yAxisId="left" fontSize={12} unit="°C" />
                                <YAxis yAxisId="right" orientation="right" fontSize={12} unit="mm" />
                                <Tooltip />
                                <Bar yAxisId="right" dataKey="rainfall" fill="#93c5fd" name="Rainfall (mm)" />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    name="Temp (°C)"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
                            No forecast data available
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="mt-3 text-center text-xs text-gray-400">
                Last updated: {new Date(weather.fetched_at).toLocaleString()}
            </p>
        </AuthenticatedLayout>
    );
}
