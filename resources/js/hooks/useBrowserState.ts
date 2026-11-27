import { useEffect, useState } from 'react';

/** Current time, re-rendering every `ms` milliseconds. */
export function useNow(ms = 1000): Date {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), ms);
        return () => clearInterval(id);
    }, [ms]);
    return now;
}

/** Tracks navigator.onLine via the online/offline events. */
export function useOnline(): boolean {
    const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
    useEffect(() => {
        const update = () => setOnline(navigator.onLine);
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, []);
    return online;
}
