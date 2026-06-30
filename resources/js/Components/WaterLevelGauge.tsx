import { cn } from '@/lib/utils';

interface WaterLevelGaugeProps {
    value: number;
    thresholds: { safe: number; warning: number; critical: number };
    size?: 'sm' | 'md' | 'lg';
}

export default function WaterLevelGauge({ value, thresholds, size = 'md' }: WaterLevelGaugeProps) {
    const level = Number(value);
    const maxLevel = thresholds.critical * 1.5;
    const percentage = Math.min((level / maxLevel) * 100, 100);

    const riskColor =
        level >= thresholds.critical
            ? 'bg-red-500'
            : level >= thresholds.warning
              ? 'bg-yellow-500'
              : 'bg-green-500';

    const dimensions = {
        sm: 'h-24 w-10',
        md: 'h-32 w-14',
        lg: 'h-40 w-18',
    };

    const safePercent = (thresholds.warning / maxLevel) * 100;
    const warnPercent = (thresholds.critical / maxLevel) * 100;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={cn('relative rounded-lg border-2 border-gray-300 bg-gray-100 overflow-hidden', dimensions[size])}>
                <div
                    className={cn('absolute bottom-0 left-0 right-0 transition-all duration-500', riskColor)}
                    style={{ height: `${percentage}%` }}
                />
                <div
                    className="absolute left-0 right-0 border-t border-dashed border-yellow-600 opacity-50"
                    style={{ bottom: `${safePercent}%` }}
                />
                <div
                    className="absolute left-0 right-0 border-t border-dashed border-red-600 opacity-50"
                    style={{ bottom: `${warnPercent}%` }}
                />
            </div>
            <span className="text-sm font-semibold">{level.toFixed(2)}m</span>
        </div>
    );
}
