import { Task, TaskStatus, TaskPriority } from '../types/task';
import { PendingTask } from '../types/pendingTask';
import { User } from '../types/user';

/**
 * Konverterar PendingTask till Task-format för UI-kompatibilitet
 */
export const pendingTaskToTask = (pendingTask: PendingTask): Task => {
  console.log('Converting pendingTask to Task:', pendingTask);
  
  // Skapa minimala User-objekt från strängvärden för kompatibilitet med Task-typen
  const assignedToUser: User | undefined = pendingTask.assigned && pendingTask.recipient ? {
    id: pendingTask.recipient,
    firstName: 'User',
    lastName: pendingTask.recipient,
    email: '',
    role: 'ROLE_USER'
  } : undefined;
  
  const assignedByUser: User | undefined = pendingTask.assigned && pendingTask.sender ? {
    id: pendingTask.sender,
    firstName: 'User',
    lastName: pendingTask.sender,
    email: '',
    role: 'ROLE_USER'
  } : undefined;
  
  return {
    id: pendingTask.id,
    title: pendingTask.title,
    description: pendingTask.description,
    status: pendingTask.status as unknown as TaskStatus, // Konvertera string till enum
    priority: pendingTask.priority as unknown as TaskPriority, // Konvertera string till enum
    createdAt: pendingTask.createdAt,
    updatedAt: pendingTask.updatedAt,
    assignedTo: assignedToUser,
    assignedBy: assignedByUser,
    dueDate: undefined // Saknas i PendingTask
  };
};

/**
 * Konverterar en array av PendingTask till Task-format
 */
export const pendingTasksToTasks = (pendingTasks: PendingTask[]): Task[] => {
  console.log('Converting array of pendingTasks to Tasks:', pendingTasks);
  return pendingTasks.map(pendingTask => pendingTaskToTask(pendingTask));
}; 