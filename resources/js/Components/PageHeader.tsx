import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    /** Right-aligned content (filters, actions, last-updated stamp). */
    actions?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

/** Standard page title block: bold navy title + gray subtitle + right actions. */
export default function PageHeader({ title, subtitle, actions, icon, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                'mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            <div className="flex items-start gap-3">
                {icon}
                <div>
                    <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
    );
}
