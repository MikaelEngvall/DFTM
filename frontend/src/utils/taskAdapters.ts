import { Task, TaskStatus, TaskPriority } from '../types/task';
import { PendingTask } from '../types/pendingTask';
import { User } from '../types/user';

/**
 * Konverterar PendingTask till Task-format för UI-kompatibilitet
 */
export const pendingTaskToTask = (pendingTask: PendingTask): Task => {
  
  // Skapa minimala User-objekt från assignedToUserId och assignedByUserId
  const assignedToUser: User | undefined = pendingTask.assignedToUserId ? {
    id: pendingTask.assignedToUserId,
    firstName: 'Användare',
    lastName: pendingTask.assignedToUserId.substring(0, 8), // Visar bara en del av ID:t för bättre läsbarhet
    email: '',
    role: 'ROLE_USER'
  } : undefined;
  
  const assignerUser: User | undefined = pendingTask.assignedByUserId ? {
    id: pendingTask.assignedByUserId,
    firstName: 'Admin',
    lastName: pendingTask.assignedByUserId.substring(0, 8), // Visar bara en del av ID:t för bättre läsbarhet
    email: '',
    role: 'ROLE_ADMIN'
  } : undefined;
  
  // Skapa en beskrivande titel baserad på tillgängliga fält
  let title = pendingTask.title;
  
  if (!title) {
    // Om title saknas, bygg en från name, address och apartment
    const namePart = pendingTask.name ? pendingTask.name : 'Okänd';
    const addressPart = pendingTask.address ? pendingTask.address : '';
    const apartmentPart = pendingTask.apartment ? `Lägenhet ${pendingTask.apartment}` : '';
    
    title = [namePart, addressPart, apartmentPart].filter(Boolean).join(' - ');
  }
  
  return {
    id: pendingTask.id,
    title: title,
    description: pendingTask.description,
    status: (pendingTask.status || 'PENDING') as unknown as TaskStatus, // Säkerställ standardvärde
    priority: (pendingTask.priority || 'MEDIUM') as unknown as TaskPriority, // Säkerställ standardvärde
    createdAt: pendingTask.createdAt || pendingTask.received || new Date().toISOString(),
    updatedAt: pendingTask.updatedAt || pendingTask.received || new Date().toISOString(),
    assignedTo: assignedToUser,
    assigner: assignerUser,
    dueDate: undefined, // Läggs till senare vid behov
    approved: pendingTask.approved || false // Säkerställ boolean-värde
  };
};

/**
 * Konverterar en array av PendingTask till Task-format
 */
export const pendingTasksToTasks = (pendingTasks: PendingTask[]): Task[] => {
  return pendingTasks.map(pendingTask => pendingTaskToTask(pendingTask));
}; 