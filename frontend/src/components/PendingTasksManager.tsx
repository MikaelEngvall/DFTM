import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userApi } from '../services/api/userApi';
import { taskApi } from '../services/api/taskApi';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { User } from '../types/user';
import { Spinner } from './ui/Spinner';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { pendingTasksToTasks, pendingTaskToTask } from '../utils/taskAdapters';

export const PendingTasksManager = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  
  // Form state
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

  useEffect(() => {
    fetchPendingTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = tasks.filter(task => 
        task.title.toLowerCase().includes(lowerCaseQuery) || 
        (task.description && task.description.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks]);

  const fetchPendingTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pendingTasksResponse = await taskApi.getPendingTasks();
      console.log('Pending tasks response:', pendingTasksResponse);
      
      // Kontrollera om det finns någon uppgift med id 67bdb085b526ba5619e3b3d1
      const targetTask = pendingTasksResponse.find(task => task.id === '67bdb085b526ba5619e3b3d1');
      if (targetTask) {
        console.log('Target task found:', targetTask);
        console.log('Task assigned:', targetTask.assigned);
        console.log('Task approved:', targetTask.approved);
      } else {
        console.log('Target task not found in response');
      }
      
      // Konvertera PendingTask till Task-format
      const convertedTasks = pendingTasksToTasks(pendingTasksResponse);
      console.log('Converted tasks:', convertedTasks);
      
      setTasks(convertedTasks);
      setFilteredTasks(convertedTasks);
    } catch (err) {
      console.error('Failed to fetch pending tasks:', err);
      setError('Failed to load pending tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      setUsers(response);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setSelectedUserId(task.assignedTo?.id || '');
    setSelectedStatus(task.status);
    setSelectedPriority(task.priority);
    setIsEditModalOpen(true);
  };

  const assignPendingTask = async (taskId: string, userId: string) => {
    try {
      await taskApi.assignPendingTask(taskId, userId);
      
      // Uppdatera den lokala uppgiften med den nya användaren
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === taskId ? {
          ...task,
          assignedTo: users.find(u => u.id === userId)
        } : task
      ));
    } catch (assignErr) {
      console.error('Failed to assign pending task:', assignErr);
      throw assignErr;
    }
  };

  // Ny funktion för att avvisa en pending task
  const rejectPendingTask = async () => {
    if (!selectedTask) return;

    try {
      // Sätt statusen till REJECTED
      const pendingTaskData = {
        title: editedTitle,
        description: editedDescription,
        status: TaskStatus.REJECTED,
        priority: selectedPriority
      };

      // Uppdatera pending task
      await taskApi.updatePendingTask(selectedTask.id, pendingTaskData);

      // Ta bort uppgiften från listan
      setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
      setFilteredTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));

      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to reject pending task:', err);
      alert(t('errors.updateFailed'));
    }
  };

  // Ny funktion för att godkänna en pending task
  const approvePendingTask = async () => {
    if (!selectedTask) return;

    // Kontrollera om uppgiften har tilldelats en användare
    if (!selectedUserId) {
      alert(t('pendingTasks.assignUserRequired'));
      return;
    }

    try {
      // Tilldela användaren först om det behövs
      if (selectedUserId !== (selectedTask.assignedTo?.id || '')) {
        await assignPendingTask(selectedTask.id, selectedUserId);
      }

      // Använd selectedUserId som både assignedToUserId och assignedByUserId
      // eftersom vi inte har ett säkert sätt att få den inloggade användarens ID här
      await taskApi.approvePendingTask(
        selectedTask.id,
        selectedUserId,
        selectedUserId // Använd samma ID som för assignedToUserId som en temporär lösning
      );

      // Ta bort uppgiften från pending tasks-listan
      setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
      setFilteredTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));

      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to approve pending task:', err);
      alert(t('errors.approvalFailed'));
    }
  };

  const saveAssignedUser = async () => {
    if (!selectedTask) return;
    
    try {
      const pendingTaskWithAssignedUser = await taskApi.assignPendingTask(selectedTask.id, selectedUserId);
      
      // Konvertera tillbaka till Task för UI
      const updatedTask = pendingTaskToTask(pendingTaskWithAssignedUser);
      
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? {
          ...updatedTask,
          assignedTo: users.find(u => u.id === selectedUserId)
        } : task
      ));
      
      setIsAssignModalOpen(false);
      // Visa bekräftelsemeddelande
    } catch (err) {
      console.error('Failed to assign pending task:', err);
      // Visa felmeddelande
    }
  };

  const saveStatus = async () => {
    if (!selectedTask) return;
    
    try {
      const pendingTaskWithUpdatedStatus = await taskApi.updatePendingTaskStatus(selectedTask.id, selectedStatus);
      
      // Konvertera tillbaka till Task för UI
      const updatedTask = pendingTaskToTask(pendingTaskWithUpdatedStatus);
      
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      
      setIsStatusModalOpen(false);
      // Visa bekräftelsemeddelande
    } catch (err) {
      console.error('Failed to update pending task status:', err);
      // Visa felmeddelande
    }
  };

  const savePriority = async () => {
    if (!selectedTask) return;
    
    try {
      const pendingTaskWithUpdatedPriority = await taskApi.updatePendingTaskPriority(selectedTask.id, selectedPriority);
      
      // Konvertera tillbaka till Task för UI
      const updatedTask = pendingTaskToTask(pendingTaskWithUpdatedPriority);
      
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      
      setIsPriorityModalOpen(false);
      // Visa bekräftelsemeddelande
    } catch (err) {
      console.error('Failed to update pending task priority:', err);
      // Visa felmeddelande
    }
  };

  // Helper för att visa prioritet med färg
  const renderPriorityBadge = (priority: TaskPriority) => {
    const colorMap = {
      [TaskPriority.LOW]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [TaskPriority.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [TaskPriority.HIGH]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [TaskPriority.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorMap[priority]}`}>
        {t(`tasks.priorities.${priority.toLowerCase()}`)}
      </span>
    );
  };

  // Helper för att visa status med färg
  const renderStatusBadge = (status: TaskStatus) => {
    const colorMap = {
      [TaskStatus.PENDING]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [TaskStatus.APPROVED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      [TaskStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorMap[status]}`}>
        {t(`tasks.statuses.${status.toLowerCase().replace('_', '')}`)}
      </span>
    );
  };

  // För att manuellt hämta en specifik uppgift för felsökning
  const fetchSpecificPendingTask = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching specific pending task with ID 67bdb085b526ba5619e3b3d1');
      const task = await taskApi.getPendingTaskById('67bdb085b526ba5619e3b3d1');
      console.log('Specific pending task response:', task);
      
      if (task) {
        console.log('Task details:');
        console.log('- ID:', task.id);
        console.log('- Title:', task.title);
        console.log('- Assigned:', task.assigned);
        console.log('- Approved:', task.approved);
        
        // Konvertera och lägg till i listan
        const convertedTask = pendingTaskToTask(task);
        setTasks(prev => [convertedTask, ...prev.filter(t => t.id !== convertedTask.id)]);
        setFilteredTasks(prev => [convertedTask, ...prev.filter(t => t.id !== convertedTask.id)]);
      }
    } catch (err) {
      console.error('Failed to fetch specific pending task:', err);
      setError('Failed to load specific pending task');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchPendingTasks}>
          Försök igen
        </Button>
        <Button 
          onClick={fetchSpecificPendingTask} 
          className="mt-2 bg-yellow-500 hover:bg-yellow-600"
        >
          Hämta specifik uppgift (67bdb085b526ba5619e3b3d1)
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{t('pendingTasks.title')}</h1>
      <p className="text-muted-foreground mb-6">{t('pendingTasks.subtitle')}</p>
      
      {/* Search och filter */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder={t('pendingTasks.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md mb-4"
        />
      </div>
      
      {/* Tabell för väntande uppgifter */}
      {filteredTasks.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <p className="text-muted-foreground">{t('pendingTasks.emptyState')}</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('tasks.title')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('tasks.description')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('tasks.status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('tasks.priority')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('tasks.assignedTo')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground font-medium">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">
                      <div className="max-w-xs truncate">{task.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                      {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : t('tasks.notAssigned')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Edit Task Modal - Comprehensive version */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('pendingTasks.editTask')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={rejectPendingTask}
            >
              {t('pendingTasks.reject')}
            </Button>
            <Button
              onClick={approvePendingTask}
              disabled={!selectedUserId}
              title={!selectedUserId ? t('pendingTasks.assignUserRequired') : ''}
            >
              {t('pendingTasks.approve')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('tasks.title')}
            </label>
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('tasks.description')}
            </label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full min-h-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground dark:bg-card dark:text-card-foreground"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('tasks.assignedTo')}
              </label>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full"
              >
                <option value="">{t('tasks.selectUser')}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName}`}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('tasks.priority')}
              </label>
              <Select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as TaskPriority)}
                className="w-full"
              >
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {t(`tasks.priorities.${priority.toLowerCase()}`)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Dialog>
      
      {/* Assign Task Modal */}
      <Dialog
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={t('pendingTasks.assignTo')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={saveAssignedUser}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('tasks.assignedTo')}
          </label>
          <Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full"
          >
            <option value="">{t('common.select')}</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </Select>
        </div>
      </Dialog>
      
      {/* Update Status Modal */}
      <Dialog
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={t('pendingTasks.updateStatus')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={saveStatus}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('tasks.status')}
          </label>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TaskStatus)}
            className="w-full"
          >
            <option value={TaskStatus.PENDING}>{t('tasks.statuses.pending')}</option>
            <option value={TaskStatus.IN_PROGRESS}>{t('tasks.statuses.inProgress')}</option>
            <option value={TaskStatus.COMPLETED}>{t('tasks.statuses.completed')}</option>
          </Select>
        </div>
      </Dialog>
      
      {/* Update Priority Modal */}
      <Dialog
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        title={t('pendingTasks.updatePriority')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsPriorityModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={savePriority}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('tasks.priority')}
          </label>
          <Select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as TaskPriority)}
            className="w-full"
          >
            <option value={TaskPriority.LOW}>{t('tasks.priorities.low')}</option>
            <option value={TaskPriority.MEDIUM}>{t('tasks.priorities.medium')}</option>
            <option value={TaskPriority.HIGH}>{t('tasks.priorities.high')}</option>
            <option value={TaskPriority.URGENT}>{t('tasks.priorities.urgent')}</option>
          </Select>
        </div>
      </Dialog>
    </div>
  );
}; 