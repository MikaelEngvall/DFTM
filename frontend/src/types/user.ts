export type UserRole = 'superadmin' | 'admin' | 'user' | 'ROLE_SUPERADMIN' | 'ROLE_ADMIN' | 'ROLE_USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  preferredLanguage?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 