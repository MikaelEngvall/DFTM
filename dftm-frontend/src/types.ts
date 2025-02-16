export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  assigned: boolean;
  assignee?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
  originalLanguage: string;
  titleTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
} 