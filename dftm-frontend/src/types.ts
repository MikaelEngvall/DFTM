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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
} 