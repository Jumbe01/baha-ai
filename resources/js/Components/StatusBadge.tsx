import { cn } from '@/lib/utils';
import { StatusLevel, statusStyle } from '@/lib/status';

interface StatusBadgeProps {
    level: StatusLevel;
    label: string;
    className?: string;
    /** Show a small leading dot. */
    dot?: boolean;
}

/**
 * Pill badge whose color is driven by the shared semantic status system.
 * Used in tables, alert lists, and device grids.
 */
export default function StatusBadge({ level, label, className, dot = false }: StatusBadgeProps) {
    const s = statusStyle(level);
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                s.badge,
                className,
            )}
        >
            {dot && <span className={cn('h-1.5 w-1.5 rounded-full', s.icon.replace('text-', 'bg-'))} />}
            {label}
        </span>
    );
}
