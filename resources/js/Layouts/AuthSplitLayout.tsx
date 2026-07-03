import HeroIllustration from '@/Components/Auth/HeroIllustration';
import Logo from '@/Components/Logo';
import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

interface AuthSplitLayoutProps {
    /** Compact hero (no illustration) for short forms like OTP. */
    compact?: boolean;
    /** Widen the form column for multi-field forms like Register. */
    wide?: boolean;
}

/**
 * Split-screen auth shell: dark navy hero panel (logo + tagline + illustration)
 * on the left, white form column on the right. Collapses to a single column on
 * mobile with a slim branded header.
 */
export default function AuthSplitLayout({
    children,
    compact = false,
    wide = false,
}: PropsWithChildren<AuthSplitLayoutProps>) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-0 sm:p-6">
            <div
                className={cn(
                    'grid w-full overflow-hidden bg-white shadow-xl sm:rounded-3xl lg:grid-cols-2',
                    wide ? 'max-w-6xl' : 'max-w-5xl',
                    'min-h-screen sm:min-h-0',
                )}
            >
                {/* Hero panel */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-navy-900 to-navy-950 p-10 lg:flex">
                    <div>
                        <Logo variant="light" stacked showTagline />
                        <div className="mx-auto my-7 h-px w-16 bg-white/20" />
                        <h2 className="font-display text-3xl font-bold leading-tight text-white">
                            Smart Monitoring.
                            <br />
                            Early Alerts.
                            <br />
                            <span className="text-accent-500">Safer Communities.</span>
                        </h2>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
                            Real-time monitoring, AI prediction, and instant alerts to help
                            communities prepare and stay safe from floods.
                        </p>
                    </div>
                    {!compact && (
                        <HeroIllustration className="mt-8 w-full rounded-2xl" />
                    )}
                </div>

                {/* Form panel */}
                <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
                    {/* Mobile brand */}
                    <div className="mb-8 flex justify-center lg:hidden">
                        <Logo variant="dark" showTagline size="lg" />
                    </div>
                    <div className="mx-auto w-full max-w-md">{children}</div>
                </div>
            </div>
        </div>
    );
}
