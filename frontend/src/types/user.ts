export type UserRole = 'superadmin' | 'admin' | 'user';

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