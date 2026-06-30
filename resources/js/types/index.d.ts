export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: 'admin' | 'staff' | 'resident';
    mobile?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    barangay?: string;
    notification_preference?: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
}

export interface FlashMessages {
    status?: string;
    success?: string;
    error?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: FlashMessages;
};
