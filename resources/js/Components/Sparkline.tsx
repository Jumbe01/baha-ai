import { statusStyle, StatusLevel } from '@/lib/status';

interface SparklineProps {
    data: number[];
    tone?: StatusLevel;
    width?: number;
    height?: number;
    className?: string;
}

/** Tiny inline trend line for table rows (no axes, no interaction). */
export default function Sparkline({
    data,
    tone = 'info',
    width = 72,
    height = 28,
    className,
}: SparklineProps) {
    if (!data || data.length < 2) {
        return <div style={{ width, height }} className={className} />;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    const color = statusStyle(tone).hex;

    const points = data.map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return (
        <svg width={width} height={height} className={className} aria-hidden="true">
            <polyline
                points={points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
