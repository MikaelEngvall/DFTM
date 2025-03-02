import { axiosInstance } from './axiosConfig';
import { api } from './api';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { PendingTask } from '../../types/pendingTask';

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

// Gränssnittstyp för uppgifter (frontend)
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

// Gränssnittstyp för uppgifter (backend)
interface BackendTask {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  assigner?: string;
  reporter?: string;
  dueDate: string;
  completedDate?: string;
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
      const response = await axiosInstance.get(`/tasks/user/${userId}?archived=${archived}`);
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
      const response = await axiosInstance.patch(`/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating task status for ${taskId}:`, error);
      throw error;
    }
  },

  // Hämta väntande uppgifter
  getPendingTasks: async (): Promise<PendingTask[]> => {
    try {
      // Hämta alla uppgifter utan filtrering
      const response = await axiosInstance.get('/pending-tasks');
      console.log('Pending tasks raw response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      throw error;
    }
  },

  // Hämta väntande uppgift med ID 
  getPendingTaskById: async (id: string): Promise<PendingTask> => {
    try {
      const response = await axiosInstance.get(`/pending-tasks/${id}`);
      console.log(`Pending task ${id} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pending task ${id}:`, error);
      throw error;
    }
  },

  // Uppdatera en väntande uppgift
  updatePendingTask: async (taskId: string, taskData: Partial<PendingTask>): Promise<PendingTask> => {
    try {
      const response = await axiosInstance.patch(`/pending-tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating pending task ${taskId}:`, error);
      throw error;
    }
  },

  // Uppdatera en väntande uppgifts status
  updatePendingTaskStatus: async (taskId: string, status: string): Promise<PendingTask> => {
    try {
      const response = await axiosInstance.patch(`/pending-tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating pending task status for ${taskId}:`, error);
      throw error;
    }
  },

  // Uppdatera en väntande uppgifts prioritet
  updatePendingTaskPriority: async (taskId: string, priority: string): Promise<PendingTask> => {
    try {
      const response = await axiosInstance.patch(`/pending-tasks/${taskId}/priority`, { priority });
      return response.data;
    } catch (error) {
      console.error(`Error updating priority for pending task ${taskId}:`, error);
      throw error;
    }
  },

  // Tilldela väntande uppgift till användare
  assignPendingTask: async (taskId: string, userId: string): Promise<PendingTask> => {
    try {
      const response = await axiosInstance.patch(`/pending-tasks/${taskId}/assign`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Error assigning pending task ${taskId} to user ${userId}:`, error);
      throw error;
    }
  },

  // Uppdatera en uppgift
  updateTask: async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },

  // Tilldela uppgift till användare
  assignTask: async (taskId: string, userId: string): Promise<Task> => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}/assign`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Error assigning task ${taskId} to user ${userId}:`, error);
      throw error;
    }
  },

  // Uppdatera uppgiftsprioritet
  updateTaskPriority: async (taskId: string, priority: TaskPriority): Promise<Task> => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}/priority`, { priority });
      return response.data;
    } catch (error) {
      console.error(`Error updating priority for task ${taskId}:`, error);
      throw error;
    }
  },

  // Lägg till en kommentar till en uppgift
  addComment: async (taskId: string, text: string): Promise<Task> => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/comments`, { text });
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
  },

  // Skapa en ny uppgift
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      // Transformera uppgift till backend-format
      const backendTask: BackendTask = {
        title: task.title,
        description: task.description,
        status: String(task.status),
        priority: String(task.priority),
        assignedTo: task.assignedTo,
        assigner: task.assigner,
        reporter: task.reporter,
        dueDate: task.dueDate,
        completedDate: task.completedDate,
        archived: task.archived,
        approved: task.approved
      };
      
      console.log('Sending task creation request:', backendTask);
      console.log('Token exists:', !!localStorage.getItem('token'));
      
      try {
        const response = await axiosInstance.post('/tasks', backendTask);
        console.log('Task creation response:', response);
        return response.data;
      } catch (apiError: unknown) {
        if (apiError && typeof apiError === 'object' && 'response' in apiError) {
          const axiosError = apiError as { 
            response?: { 
              status?: number, 
              data?: any, 
              headers?: any 
            } 
          };
          console.error('API error details:', {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            headers: axiosError.response?.headers
          });
        }
        throw apiError;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
}; 