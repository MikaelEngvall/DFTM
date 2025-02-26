export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    preferredLanguage: string;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ApiError {
    status?: number;
    data?: Record<string, unknown>;
    message?: string;
}

export interface PendingTask {
    id: string;
    title: string;
    description: string;
    reporter: string;
    status: string;
    priority: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    titleTranslations: Record<string, string>;
    descriptionTranslations: Record<string, string>;
    originalLanguage: string;
} 