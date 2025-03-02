import { Task, TaskStatus, TaskPriority } from '../types/task';
import { PendingTask } from '../types/pendingTask';

/**
 * Konverterar PendingTask till Task-format för UI-kompatibilitet
 */
export const pendingTaskToTask = (pendingTask: PendingTask): Task => {
  return {
    id: pendingTask.id,
    title: pendingTask.title,
    description: pendingTask.description,
    status: pendingTask.status as unknown as TaskStatus, // Konvertera string till enum
    priority: pendingTask.priority as unknown as TaskPriority, // Konvertera string till enum
    createdAt: pendingTask.createdAt,
    updatedAt: pendingTask.updatedAt,
    // Lägg till defaultvärden för fält som inte finns i PendingTask
    assignedTo: undefined,
    assignedBy: undefined,
    dueDate: undefined // Saknas i PendingTask
  };
};

/**
 * Konverterar en array av PendingTask till Task-format
 */
export const pendingTasksToTasks = (pendingTasks: PendingTask[]): Task[] => {
  return pendingTasks.map(pendingTask => pendingTaskToTask(pendingTask));
}; 