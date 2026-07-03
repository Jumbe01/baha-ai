import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface InfoBannerProps {
    children: React.ReactNode;
    /** Right-aligned content (e.g. "Last updated: ..."). */
    trailing?: React.ReactNode;
    className?: string;
}

/** Light-blue rounded footer strip with an info icon (used at page bottoms). */
export default function InfoBanner({ children, trailing, className }: InfoBannerProps) {
    return (
        <div
            className={cn(
                'mt-6 flex flex-col gap-2 rounded-2xl bg-brand-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500">
                    <Info className="h-4 w-4 text-white" />
                </span>
                <p className="text-sm text-slate-600">{children}</p>
            </div>
            {trailing && <div className="pl-9 text-xs text-slate-500 sm:pl-0">{trailing}</div>}
        </div>
    );
}
