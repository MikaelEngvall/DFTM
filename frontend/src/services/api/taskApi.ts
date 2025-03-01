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
      const response = await axiosInstance.post('/tasks', backendTask);
      console.log('Task creation response:', response);
      
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Skapa exempeluppgifter där Mikael Engvall tilldelar uppgifter till en vanlig användare
  createExampleTasks: async (assignerId: string, assignedToId: string): Promise<void> => {
    try {
      console.log('Skapar exempeluppgifter...');

      // Uppgift med dagens datum
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];

      await taskApi.createTask({
        title: 'Granska dokumentation',
        description: 'Granska den tekniska dokumentationen för backend-systemet före publicering.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        assignedTo: assignedToId,
        assigner: assignerId,
        dueDate: formattedToday,
        archived: false,
        approved: false
      });

      // Uppgift med datum nästa vecka
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const formattedNextWeek = nextWeek.toISOString().split('T')[0];

      await taskApi.createTask({
        title: 'Implementera JWT-autentisering',
        description: 'Integrera JWT-autentisering i frontend-applikationen och testa mot backend-API:et.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        assignedTo: assignedToId,
        assigner: assignerId,
        dueDate: formattedNextWeek,
        archived: false,
        approved: false
      });

      // Uppgift med datum förra veckan (försenad)
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      const formattedLastWeek = lastWeek.toISOString().split('T')[0];

      await taskApi.createTask({
        title: 'Uppdatera användarhandboken',
        description: 'Uppdatera användarhandboken med de senaste funktionerna som implementerats.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        assignedTo: assignedToId,
        assigner: assignerId,
        dueDate: formattedLastWeek,
        archived: false,
        approved: false
      });

      console.log('Alla exempeluppgifter har skapats framgångsrikt!');
    } catch (error) {
      console.error('Fel vid skapande av exempeluppgifter:', error);
      throw error;
    }
  }
}; 