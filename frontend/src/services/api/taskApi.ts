import { axiosInstance } from './axiosConfig';

// Uppgifternas prioritetsnivåer
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Uppgifternas status
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Gränssnittstyp för uppgifter
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  assigner?: string;
  reporter?: string;
  dueDate: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  comments?: string[];
  archived: boolean;
  approved: boolean;
}

// Gränssnittstyp för kommentarer
export interface Comment {
  id: string;
  taskId: string;
  text: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Task API service
export const taskApi = {
  // Hämta alla uppgifter
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await axiosInstance.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Hämta uppgifter för en specifik användare
  getTasksByUser: async (userId: string, archived: boolean = false): Promise<Task[]> => {
    try {
      const response = await axiosInstance.get(`/tasks/user/${userId}`, {
        params: { archived }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks for user ${userId}:`, error);
      throw error;
    }
  },

  // Hämta en specifik uppgift med ID
  getTaskById: async (id: string): Promise<Task> => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  // Uppdatera en uppgifts status
  updateTaskStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
    try {
      const response = await axiosInstance.put(`/tasks/${taskId}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating status for task ${taskId}:`, error);
      throw error;
    }
  },

  // Lägg till en kommentar till en uppgift
  addComment: async (taskId: string, text: string): Promise<Comment> => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/comments`, {
        text
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to task ${taskId}:`, error);
      throw error;
    }
  },

  // Hämta kommentarer för en uppgift
  getComments: async (taskId: string): Promise<Comment[]> => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for task ${taskId}:`, error);
      throw error;
    }
  }
}; 