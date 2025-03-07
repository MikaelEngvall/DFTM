import { User } from './user';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_FEASIBLE = 'NOT_FEASIBLE',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TaskDescription {
  sv: string;
  en: string;
  pl: string;
  uk: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | TaskDescription;
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