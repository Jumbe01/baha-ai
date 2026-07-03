import Logo from '@/Components/Logo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-8">
            <Link href="/">
                <Logo variant="dark" showTagline size="lg" />
            </Link>

            <div className="mt-8 w-full max-w-md rounded-3xl bg-white px-6 py-8 shadow-xl sm:px-10">
                {children}
            </div>
        </div>
    );
}
