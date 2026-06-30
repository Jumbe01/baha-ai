interface ConfidenceGaugeProps {
    value: number;
    size?: number;
}

export default function ConfidenceGauge({ value, size = 80 }: ConfidenceGaugeProps) {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const color = value >= 70 ? '#22c55e' : value >= 40 ? '#eab308' : '#ef4444';

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={6}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={6}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
            </svg>
            <span className="absolute text-sm font-bold" style={{ color }}>
                {Math.round(value)}%
            </span>
        </div>
    );
}
