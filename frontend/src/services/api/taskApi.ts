import { axiosInstance } from './axiosConfig';
// import { api } from './api'; // Denna import används inte
import { Task, TaskStatus, TaskPriority, TaskComment } from '../../types/task';
import { PendingTask } from '../../types/pendingTask';

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
  updateTaskStatus: async (taskId: string, newStatus: TaskStatus): Promise<Task> => {
    console.log(`Uppdaterar uppgift ${taskId} till status ${newStatus}`);
    
    try {
      console.log(`Gör PATCH-anrop till: /tasks/${taskId}/status`);
      const response = await axiosInstance.patch(`/tasks/${taskId}/status`, { status: newStatus });
      console.log('PATCH-anrop lyckades:', response.data);
      return response.data;
    } catch (error) {
      console.error(`PATCH-anrop misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
      
      // Logga mer information om felet
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number, 
            data?: unknown, 
            headers?: unknown
          } 
        };
        console.error('API error details:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers
        });
      }
      
      // Trots 403-fel, försök hämta uppgiften för att se om statusen uppdaterades
      if (taskId) {
        try {
          console.log('Kontrollerar om uppgiften uppdaterades trots fel...');
          const refreshedTask = await axiosInstance.get(`/tasks/${taskId}`);
          
          if (refreshedTask.data && refreshedTask.data.status === newStatus) {
            console.log('Uppgiften uppdaterades trots felmeddelandet!');
            return refreshedTask.data;
          } else {
            console.log('Uppgiften uppdaterades inte. Nuvarande status:', 
              refreshedTask.data ? refreshedTask.data.status : 'okänd');
          }
        } catch (refreshError) {
          console.error('Kunde inte kontrollera uppgiftens status:', refreshError);
        }
      }
      
      throw new Error(`Kunde inte uppdatera uppgiftens status: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
  },

  // Hämta väntande uppgifter
  getPendingTasks: async (): Promise<PendingTask[]> => {
    try {
      console.log('Fetching pending tasks...');
      // Vi hämtar alla pending tasks utan filter för att säkerställa att vi får alla från kollektionen
      const response = await axiosInstance.get('/pending-tasks');
      console.log('Raw pending tasks response:', response);
      console.log('Pending tasks data:', JSON.stringify(response.data));
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

  // Hämta kommentarer för en uppgift
  getComments: async (taskId: string): Promise<TaskComment[]> => {
    try {
      console.log(`Fetching comments for task ${taskId}`);
      
      // Använd standardspråket (SV) om inget annat anges
      const response = await axiosInstance.get(`/tasks/${taskId}/comments?language=SV`);
      console.log('Comments fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for task ${taskId}:`, error);
      throw error;
    }
  },

  // Lägg till en kommentar till en uppgift
  addComment: async (taskId: string, text: string): Promise<TaskComment> => {
    try {
      console.log(`Attempting to add comment to task ${taskId}, text: ${text}`);
      
      // Hämta CSRF-token från cookie om den finns
      const csrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='));
      
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      // Konfigurera headers med CSRF-token
      const headers: Record<string, string> = {};
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      const response = await axiosInstance.post(
        `/tasks/${taskId}/comments`, 
        { text }, 
        { headers }
      );
      console.log('Comment added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to task ${taskId}:`, error);
      throw error;
    }
  },

  // Skapa en ny uppgift
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      // Transformera uppgift till backend-format
      const backendTask = {
        title: task.title,
        description: task.description,
        status: String(task.status),
        priority: String(task.priority),
        assignedTo: task.assignedTo?.id,
        assigner: task.assigner?.id,
        dueDate: task.dueDate,
        completedDate: task.completedDate,
        approved: task.approved ?? true
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
              data?: unknown, 
              headers?: unknown
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
  },

  // Korrigerar approvePendingTask för att använda korrekt anropsmetod
  approvePendingTask: async (
    taskId: string,
    assignedToUserId: string,
    assignedByUserId: string,
    dueDate?: Date | null
  ): Promise<PendingTask> => {
    try {
      const params: Record<string, string> = {
        assignedToUserId,
        assignedByUserId
      };

      // Lägg till dueDate i parametrar om det finns
      if (dueDate) {
        params.dueDate = dueDate.toISOString();
      }

      const response = await axiosInstance.patch<PendingTask>(
        `/pending-tasks/${taskId}/approve`, 
        null, 
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to approve pending task:', error);
      throw error;
    }
  },

  // Funktion för att avvisa en pending task
  rejectPendingTask: async (taskId: string): Promise<PendingTask> => {
    try {
      const response = await axiosInstance.patch<PendingTask>(
        `/pending-tasks/${taskId}/status`,
        { status: 'REJECTED' }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to reject pending task:', error);
      throw error;
    }
  }
}; 