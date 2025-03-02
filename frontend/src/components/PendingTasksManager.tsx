import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { userApi } from '../services/api/userApi';
import { taskApi } from '../services/api/taskApi';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { User } from '../types/user';
import { Spinner } from './ui/Spinner';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

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
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  
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
      // Antar att API:t har en funktion för att hämta väntande uppgifter
      const response = await taskApi.getPendingTasks();
      setTasks(response);
      setFilteredTasks(response);
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

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setIsEditModalOpen(true);
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

  const handleAssignTask = (task: Task) => {
    setSelectedTask(task);
    setSelectedUserId(task.assignedTo?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleUpdateStatus = (task: Task) => {
    setSelectedTask(task);
    setSelectedStatus(task.status);
    setIsStatusModalOpen(true);
  };

  const handleUpdatePriority = (task: Task) => {
    setSelectedTask(task);
    setSelectedPriority(task.priority);
    setIsPriorityModalOpen(true);
  };

  const handleApproveTask = (task: Task) => {
    setSelectedTask(task);
    setIsApproveModalOpen(true);
  };

  const handleRejectTask = (task: Task) => {
    setSelectedTask(task);
    setIsRejectModalOpen(true);
  };

  const saveEditedTask = async () => {
    if (!selectedTask) return;
    
    try {
      // Först uppdaterar vi grundläggande information
      const updatedTask = await taskApi.updateTask(selectedTask.id, {
        ...selectedTask,
        title: editedTitle,
        description: editedDescription,
        status: selectedStatus,
        priority: selectedPriority
      });
      
      // Om användaren har tilldelats, uppdatera det också
      if (selectedUserId && (selectedTask.assignedTo?.id !== selectedUserId)) {
        await taskApi.assignTask(selectedTask.id, selectedUserId);
      }
      
      // Uppdatera listan med uppgifter
      setTasks(prevTasks => {
        // Om uppgiftens status är APPROVED eller REJECTED, ta bort den från listan
        if (selectedStatus === TaskStatus.APPROVED || selectedStatus === TaskStatus.REJECTED) {
          return prevTasks.filter(task => task.id !== updatedTask.id);
        }
        // Annars uppdatera den i listan
        return prevTasks.map(task => 
          task.id === updatedTask.id ? {
            ...updatedTask,
            // Om vi har tilldelat en användare, uppdatera den också i vår lokala uppgift
            assignedTo: selectedUserId ? users.find(u => u.id === selectedUserId) : task.assignedTo
          } : task
        );
      });
      
      setIsEditModalOpen(false);
      // Visa bekräftelsemeddelande eller notification här om det behövs
    } catch (err) {
      console.error('Failed to update task:', err);
      // Visa felmeddelande här om det behövs
    }
  };

  const saveAssignedUser = async () => {
    if (!selectedTask) return;
    
    try {
      const updatedTask = await taskApi.assignTask(selectedTask.id, selectedUserId);
      
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      
      setIsAssignModalOpen(false);
      // Visa bekräftelsemeddelande
    } catch (err) {
      console.error('Failed to assign task:', err);
      // Visa felmeddelande
    }
  };

  const saveStatus = async () => {
    if (!selectedTask) return;
    
    try {
      const updatedTask = await taskApi.updateTaskStatus(selectedTask.id, selectedStatus);
      
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      
      setIsStatusModalOpen(false);
      // Visa bekräftelsemeddelande
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Visa felmeddelande
    }
  };

  const savePriority = async () => {
    if (!selectedTask) return;
    
    try {
      const updatedTask = await taskApi.updateTaskPriority(selectedTask.id, selectedPriority);
      
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      
      setIsPriorityModalOpen(false);
      // Visa bekräftelsemeddelande
    } catch (err) {
      console.error('Failed to update task priority:', err);
      // Visa felmeddelande
    }
  };

  const approveTask = async () => {
    if (!selectedTask) return;
    
    try {
      const updatedTask = await taskApi.updateTaskStatus(selectedTask.id, TaskStatus.APPROVED);
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== updatedTask.id));
      
      setIsApproveModalOpen(false);
      // Visa bekräftelsemeddelande
    } catch (err) {
      console.error('Failed to approve task:', err);
      // Visa felmeddelande
    }
  };

  const rejectTask = async () => {
    if (!selectedTask) return;
    
    try {
      const updatedTask = await taskApi.updateTaskStatus(selectedTask.id, TaskStatus.REJECTED);
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== updatedTask.id));
      
      setIsRejectModalOpen(false);
      // Visa bekräftelsemeddelande
    } catch (err) {
      console.error('Failed to reject task:', err);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchPendingTasks}>
          {t('common.tryAgain')}
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
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('common.actions')}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                          title={t('pendingTasks.editTask')}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveTask(task);
                          }}
                          title={t('pendingTasks.approve')}
                        >
                          <FiCheck className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectTask(task);
                          }}
                          title={t('pendingTasks.reject')}
                        >
                          <FiX className="w-4 h-4" />
                        </Button>
                      </div>
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
            <Button onClick={saveEditedTask}>
              {t('common.save')}
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
                {t('tasks.status')}
              </label>
              <div className="flex space-x-2">
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TaskStatus)}
                  className="w-full"
                >
                  <option value={TaskStatus.PENDING}>{t('tasks.statuses.pending')}</option>
                  <option value={TaskStatus.IN_PROGRESS}>{t('tasks.statuses.inProgress')}</option>
                  <option value={TaskStatus.COMPLETED}>{t('tasks.statuses.completed')}</option>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedTask) {
                      handleUpdateStatus(selectedTask);
                    }
                  }}
                  title={t('pendingTasks.updateStatus')}
                >
                  {t('common.change')}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('tasks.priority')}
              </label>
              <div className="flex space-x-2">
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedTask) {
                      handleUpdatePriority(selectedTask);
                    }
                  }}
                  title={t('pendingTasks.updatePriority')}
                >
                  {t('common.change')}
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('tasks.assignedTo')}
            </label>
            <div className="flex space-x-2">
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (selectedTask) {
                    handleAssignTask(selectedTask);
                  }
                }}
                title={t('pendingTasks.assignTo')}
              >
                {t('common.assign')}
              </Button>
            </div>
          </div>
          {selectedTask && (
            <div className="pt-4 border-t mt-4">
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                  onClick={approveTask}
                >
                  <FiCheck className="w-4 h-4 mr-2" />
                  {t('pendingTasks.approve')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={rejectTask}
                >
                  <FiX className="w-4 h-4 mr-2" />
                  {t('pendingTasks.reject')}
                </Button>
              </div>
            </div>
          )}
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
      
      {/* Approve Task Confirmation */}
      <Dialog
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title={t('pendingTasks.approve')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={approveTask}
            >
              {t('pendingTasks.approve')}
            </Button>
          </>
        }
      >
        <p>{t('pendingTasks.confirmApprove')}</p>
      </Dialog>
      
      {/* Reject Task Confirmation */}
      <Dialog
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={t('pendingTasks.reject')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={rejectTask}
            >
              {t('pendingTasks.reject')}
            </Button>
          </>
        }
      >
        <p>{t('pendingTasks.confirmReject')}</p>
      </Dialog>
    </div>
  );
}; 