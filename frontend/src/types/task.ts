import { User } from './user';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_FEASIBLE = 'NOT_FEASIBLE',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User;
  assigner?: User;
  approved?: boolean;
}

export interface TaskComment {
  id: string;
  text: string;
  createdBy: User;
  createdAt: string;
  taskId: string;
} 