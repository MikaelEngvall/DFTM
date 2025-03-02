export type UserRole = 'ROLE_SUPERADMIN' | 'ROLE_ADMIN' | 'ROLE_USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  preferredLanguage?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  active?: boolean;
} 