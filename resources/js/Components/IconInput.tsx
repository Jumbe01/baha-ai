import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon: LucideIcon;
    /** Render a show/hide toggle (forces type password/text). */
    passwordToggle?: boolean;
}

/**
 * Rounded input with a leading icon — the form field style used throughout the
 * auth screens and settings. Supports an optional password visibility toggle.
 */
const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
    ({ icon: Icon, passwordToggle, className, type = 'text', ...props }, ref) => {
        const [show, setShow] = useState(false);
        const resolvedType = passwordToggle ? (show ? 'text' : 'password') : type;

        return (
            <div className="relative">
                <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    ref={ref}
                    type={resolvedType}
                    className={cn(
                        'h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-slate-900 placeholder:text-slate-400',
                        'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30',
                        passwordToggle && 'pr-11',
                        className,
                    )}
                    {...props}
                />
                {passwordToggle && (
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={show ? 'Hide password' : 'Show password'}
                    >
                        {show ? <EyeOff /> : <Eye />}
                    </button>
                )}
            </div>
        );
    },
);
IconInput.displayName = 'IconInput';

function Eye() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOff() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6A13.3 13.3 0 0 0 2 11s3.5 7 10 7a9 9 0 0 0 5.4-1.6M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default IconInput;
