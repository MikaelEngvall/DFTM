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
  
  const assignerUser: User | undefined = pendingTask.assigned && pendingTask.sender ? {
    id: pendingTask.sender,
    firstName: 'User',
    lastName: pendingTask.sender,
    email: '',
    role: 'ROLE_USER'
  } : undefined;
  
  // Använd name, adress och apartment för att skapa en titel om title inte finns
  const title = pendingTask.title || 
    `${pendingTask.name || 'Okänd'} - ${pendingTask.address || ''} ${pendingTask.apartment || ''}`.trim();
  
  return {
    id: pendingTask.id,
    title: title,
    description: pendingTask.description,
    status: (pendingTask.status || 'NEW') as unknown as TaskStatus, // Konvertera string till enum
    priority: (pendingTask.priority || 'MEDIUM') as unknown as TaskPriority, // Konvertera string till enum
    createdAt: pendingTask.createdAt || pendingTask.received || new Date().toISOString(), // Garantera ett värde
    updatedAt: pendingTask.updatedAt || pendingTask.received || new Date().toISOString(),
    assignedTo: assignedToUser,
    assigner: assignerUser,
    dueDate: undefined, // Saknas i PendingTask
    approved: pendingTask.approved // Använd värdet direkt, det är redan en boolean
  };
};

/**
 * Konverterar en array av PendingTask till Task-format
 */
export const pendingTasksToTasks = (pendingTasks: PendingTask[]): Task[] => {
  console.log('Converting array of pendingTasks to Tasks:', pendingTasks);
  return pendingTasks.map(pendingTask => pendingTaskToTask(pendingTask));
}; 