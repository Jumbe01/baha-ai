import { statusStyle } from '@/lib/status';

// The backend only emits safe / warning / critical for zones and sensors.
const items = [
    { color: statusStyle('safe').hex, label: 'Safe' },
    { color: statusStyle('warning').hex, label: 'Warning' },
    { color: statusStyle('critical').hex, label: 'Critical' },
];

export default function MapLegend() {
    return (
        <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-md backdrop-blur">
            <p className="mb-2 text-xs font-semibold text-gray-700">Risk Level</p>
            <div className="space-y-1">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
