/**
 * Semantic status tokens shared across the app (stat cards, badges, tables).
 * Each level maps to a consistent color family so "warning" always looks the
 * same whether it's a badge, an icon tint, or a chart band.
 */
export type StatusLevel =
    | 'safe'
    | 'normal'
    | 'moderate'
    | 'warning'
    | 'critical'
    | 'high'
    | 'info'
    | 'neutral';

interface StatusStyle {
    /** Text color for the status word. */
    text: string;
    /** Soft tinted background (icon circles, badge fills). */
    softBg: string;
    /** Icon color on the soft background. */
    icon: string;
    /** Badge classes (bg + text). */
    badge: string;
    /** Left accent border for table rows / list items. */
    border: string;
    /** Raw hex (charts, sparklines). */
    hex: string;
}

const STYLES: Record<StatusLevel, StatusStyle> = {
    safe: {
        text: 'text-emerald-600',
        softBg: 'bg-emerald-50',
        icon: 'text-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700',
        border: 'border-l-emerald-500',
        hex: '#10b981',
    },
    normal: {
        text: 'text-emerald-600',
        softBg: 'bg-emerald-50',
        icon: 'text-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700',
        border: 'border-l-emerald-500',
        hex: '#10b981',
    },
    moderate: {
        text: 'text-amber-600',
        softBg: 'bg-amber-50',
        icon: 'text-amber-500',
        badge: 'bg-amber-100 text-amber-700',
        border: 'border-l-amber-500',
        hex: '#f59e0b',
    },
    warning: {
        text: 'text-orange-600',
        softBg: 'bg-orange-50',
        icon: 'text-orange-500',
        badge: 'bg-orange-100 text-orange-700',
        border: 'border-l-orange-500',
        hex: '#f97316',
    },
    critical: {
        text: 'text-red-600',
        softBg: 'bg-red-50',
        icon: 'text-red-500',
        badge: 'bg-red-100 text-red-700',
        border: 'border-l-red-500',
        hex: '#ef4444',
    },
    high: {
        text: 'text-red-600',
        softBg: 'bg-red-50',
        icon: 'text-red-500',
        badge: 'bg-red-100 text-red-700',
        border: 'border-l-red-500',
        hex: '#ef4444',
    },
    info: {
        text: 'text-brand-600',
        softBg: 'bg-brand-50',
        icon: 'text-brand-500',
        badge: 'bg-brand-100 text-brand-700',
        border: 'border-l-brand-500',
        hex: '#2563eb',
    },
    neutral: {
        text: 'text-slate-600',
        softBg: 'bg-slate-100',
        icon: 'text-slate-500',
        badge: 'bg-slate-100 text-slate-700',
        border: 'border-l-slate-300',
        hex: '#64748b',
    },
};

export function statusStyle(level: StatusLevel): StatusStyle {
    return STYLES[level] ?? STYLES.neutral;
}

/** Map an arbitrary risk string (from the API) to a StatusLevel. */
export function riskToStatus(risk?: string | null): StatusLevel {
    switch ((risk ?? '').toLowerCase()) {
        case 'safe':
        case 'normal':
        case 'clear':
            return 'safe';
        case 'moderate':
            return 'moderate';
        case 'warning':
            return 'warning';
        case 'critical':
        case 'high':
        case 'high risk':
        case 'danger':
            return 'critical';
        default:
            return 'neutral';
    }
}
