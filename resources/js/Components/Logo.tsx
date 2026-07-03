import { cn } from '@/lib/utils';

interface LogoMarkProps {
    className?: string;
    /** Stroke color for the arch/house/waves. Defaults to currentColor. */
    color?: string;
    accent?: string;
}

/**
 * BahaAI logo mark: a house sheltered under a protective arch, a wifi signal,
 * and water waves below — representing IoT flood monitoring for the home.
 * Hand-built SVG (not derived from any raster asset) so it scales crisply.
 */
export function LogoMark({ className, color = 'currentColor', accent }: LogoMarkProps) {
    const wave = accent ?? color;
    return (
        <svg
            viewBox="0 0 64 56"
            fill="none"
            className={className}
            role="img"
            aria-label="BahaAI"
        >
            {/* Protective arch (open at the top-right for the wifi) */}
            <path
                d="M10 30a22 22 0 0 1 37-16"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
            {/* House body */}
            <path
                d="M20 32v-7l12-9 12 9v7"
                stroke={color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <path
                d="M28 32v-6h8v6"
                stroke={color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            {/* Wifi signal */}
            <path
                d="M49 15a9 9 0 0 1 6 6M50.5 10.5a15 15 0 0 1 9.5 9.5"
                stroke={accent ?? color}
                strokeWidth="3"
                strokeLinecap="round"
            />
            {/* Water waves */}
            {[38, 45, 52].map((y, i) => (
                <path
                    key={y}
                    d={`M14 ${y}c3-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0`}
                    stroke={wave}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity={1 - i * 0.18}
                />
            ))}
        </svg>
    );
}

interface LogoProps {
    className?: string;
    /** 'light' for dark backgrounds (navy sidebar/hero), 'dark' for light backgrounds. */
    variant?: 'light' | 'dark';
    /** Stack the mark above the wordmark and center everything. */
    stacked?: boolean;
    showTagline?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const wordSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
};

const markSize = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-16 w-16',
};

export default function Logo({
    className,
    variant = 'dark',
    stacked = false,
    showTagline = false,
    size = 'md',
}: LogoProps) {
    const light = variant === 'light';
    const markColor = light ? '#ffffff' : '#1d3d6b';
    const bahaColor = light ? 'text-white' : 'text-navy-800';

    return (
        <div
            className={cn(
                'flex',
                stacked ? 'flex-col items-center gap-2 text-center' : 'items-center gap-2.5',
                className,
            )}
        >
            <LogoMark
                className={cn(stacked ? markSize.lg : markSize[size])}
                color={markColor}
                accent="#38bdf8"
            />
            <div className={stacked ? 'flex flex-col items-center' : ''}>
                <span
                    className={cn(
                        'font-display font-bold leading-none tracking-tight',
                        stacked ? 'text-4xl' : wordSize[size],
                        bahaColor,
                    )}
                >
                    Baha<span className="text-accent-500">AI</span>
                </span>
                {showTagline && (
                    <span
                        className={cn(
                            'mt-1 text-xs font-medium tracking-wide',
                            light ? 'text-slate-300' : 'text-slate-500',
                        )}
                    >
                        IoT-Based Flood Alert System
                    </span>
                )}
            </div>
        </div>
    );
}
