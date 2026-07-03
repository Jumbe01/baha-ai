import { cn } from '@/lib/utils';
import { StatusLevel, statusStyle } from '@/lib/status';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon: LucideIcon;
    /** Drives the icon tint and the status word color. */
    tone?: StatusLevel;
    /** Small colored status word under the value (e.g. "Moderate", "Heavy Rain"). */
    status?: string;
    /** Muted helper line at the bottom (e.g. "Today, 9:30 AM"). */
    meta?: string;
    /** Optional trailing element in the meta row (e.g. a delta). */
    metaTrailing?: React.ReactNode;
    className?: string;
}

/**
 * KPI card matching the reference: pastel icon circle, tiny label, big bold
 * number, colored status word, muted meta line.
 */
export default function StatCard({
    label,
    value,
    unit,
    icon: Icon,
    tone = 'info',
    status,
    meta,
    metaTrailing,
    className,
}: StatCardProps) {
    const s = statusStyle(tone);
    return (
        <div
            className={cn(
                'rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card',
                className,
            )}
        >
            <div className="flex items-start gap-4">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', s.softBg)}>
                    <Icon className={cn('h-6 w-6', s.icon)} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-0.5 font-display text-2xl font-bold text-slate-900">
                        {value}
                        {unit && <span className="ml-1 text-base font-semibold text-slate-500">{unit}</span>}
                    </p>
                    {status && <p className={cn('text-sm font-semibold', s.text)}>{status}</p>}
                    {(meta || metaTrailing) && (
                        <div className="mt-1 flex items-center justify-between gap-2">
                            {meta && <span className="text-xs text-slate-400">{meta}</span>}
                            {metaTrailing}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
