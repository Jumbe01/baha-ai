import { cn } from '@/lib/utils';
import { statusStyle } from '@/lib/status';

interface WaterGaugeProps {
    value: number;
    max?: number;
    warning?: number;
    critical?: number;
    className?: string;
}

/**
 * Vertical water-level gauge with a scale, threshold markers, and a blue fill —
 * matches the reference station readout. Fill color reflects the risk band.
 */
export default function WaterGauge({
    value,
    max = 4,
    warning,
    critical,
    className,
}: WaterGaugeProps) {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100);
    const warningHex = statusStyle('warning').hex;
    const criticalHex = statusStyle('critical').hex;
    // Below warning the fill stays water-blue (info), not "safe" green.
    const fill =
        critical != null && value >= critical
            ? criticalHex
            : warning != null && value >= warning
              ? warningHex
              : statusStyle('info').hex;

    const ticks = Array.from({ length: 5 }, (_, i) => ((max / 4) * (4 - i)).toFixed(2));

    return (
        <div className={cn('flex items-stretch gap-2', className)}>
            <div className="flex flex-col justify-between py-0.5 text-[10px] tabular-nums text-slate-400">
                {ticks.map((t) => (
                    <span key={t}>{t}</span>
                ))}
            </div>
            <div className="relative h-32 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <div
                    className="absolute inset-x-0 bottom-0 transition-all duration-500"
                    style={{ height: `${pct}%`, backgroundColor: fill }}
                />
                {warning != null && (
                    <div className="absolute inset-x-0 border-t border-dashed opacity-70" style={{ bottom: `${(warning / max) * 100}%`, borderColor: warningHex }} />
                )}
                {critical != null && (
                    <div className="absolute inset-x-0 border-t border-dashed opacity-70" style={{ bottom: `${(critical / max) * 100}%`, borderColor: criticalHex }} />
                )}
            </div>
        </div>
    );
}
