import { cn } from '@/lib/utils';

interface SectionCardProps {
    title?: React.ReactNode;
    /** Right-aligned header content (e.g. "View All →", a dropdown, tabs). */
    action?: React.ReactNode;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    /** Remove default body padding (e.g. for full-bleed tables/maps). */
    flush?: boolean;
}

/**
 * White rounded content panel with an optional title row — the workhorse
 * container for every dashboard section.
 */
export default function SectionCard({
    title,
    action,
    icon,
    children,
    className,
    bodyClassName,
    flush = false,
}: SectionCardProps) {
    return (
        <div className={cn('rounded-2xl border border-slate-200/70 bg-white shadow-card', className)}>
            {(title || action) && (
                <div className="flex items-center justify-between gap-3 px-5 pt-5">
                    <div className="flex items-center gap-2">
                        {icon}
                        {typeof title === 'string' ? (
                            <h2 className="font-display text-lg font-semibold text-navy-900">{title}</h2>
                        ) : (
                            title
                        )}
                    </div>
                    {action}
                </div>
            )}
            <div className={cn(flush ? '' : 'p-5', bodyClassName)}>{children}</div>
        </div>
    );
}
