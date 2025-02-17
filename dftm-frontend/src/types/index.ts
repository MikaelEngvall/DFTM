export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    preferredLanguage: string | null;
    createdAt: string | null;
    updatedAt: string | null;
} 