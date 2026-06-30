import { Activity } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                        <Activity className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">BahaAI</span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
