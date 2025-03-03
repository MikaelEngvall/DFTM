import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userApi } from '../services/api/userApi';
import { taskApi } from '../services/api/taskApi';
import { Task, TaskStatus, TaskPriority, TaskDescription } from '../types/task';
import { User } from '../types/user';
import { Spinner } from './ui/Spinner';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { pendingTasksToTasks, pendingTaskToTask } from '../utils/taskAdapters';
import { Notification } from './ui/Notification';

export const PendingTasksManager = () => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApproved, setShowApproved] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  
  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  
  // Form state
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  // Flerspråkig beskrivning
  const [editedDescriptionSv, setEditedDescriptionSv] = useState('');
  const [editedDescriptionEn, setEditedDescriptionEn] = useState('');
  const [editedDescriptionPl, setEditedDescriptionPl] = useState('');
  const [editedDescriptionUk, setEditedDescriptionUk] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [selectedDueDate, setSelectedDueDate] = useState<string>('');

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    message: ''
  });

  useEffect(() => {
    fetchPendingTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Filtrering baserad på status
      const filtered = tasks.filter(task => {
        // Visa godkända uppgifter ENDAST om showApproved är true
        if (task.status === TaskStatus.APPROVED) {
          return showApproved;
        }
        if (task.status === TaskStatus.REJECTED) {
          return showRejected;
        }
        return true;
      });
      setFilteredTasks(filtered);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = tasks.filter(task => {
        // Först kontrollera status
        if (task.status === TaskStatus.APPROVED && !showApproved) {
          return false;
        }
        if (task.status === TaskStatus.REJECTED && !showRejected) {
          return false;
        }
        // Sedan kontrollera söktexten
        return task.title.toLowerCase().includes(lowerCaseQuery) || 
          (task.description && task.description.toLowerCase().includes(lowerCaseQuery));
      });
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks, showApproved, showRejected]);

  const fetchPendingTasks = async () => {
    setIsLoading(true);
    
    try {
      console.log('Hämtar väntande uppgifter...');
      const pendingTasks = await taskApi.getPendingTasks();
      console.log('Hämtade pending tasks:', pendingTasks);
      
      // Konvertera till Task-format för UI-kompatibilitet
      const tasksList = pendingTasksToTasks(pendingTasks);
      console.log('Konverterade till tasks-format:', tasksList);
      
      // Ladda användarinformation för assignedToUserId om det finns
      const tasksWithUserInfo = await Promise.all(tasksList.map(async (task) => {
        if (task.assignedTo && task.assignedTo.id) {
          try {
            const user = await userApi.getUserById(task.assignedTo.id);
            return {
              ...task,
              assignedTo: user // Ersätt med den fullständiga användarinformationen
            };
          } catch (error) {
            console.error(`Kunde inte hämta användarinfo för ${task.assignedTo.id}:`, error);
            return task;
          }
        }
        return task;
      }));
      
      // Spara alla uppgifter i tasks-state för senare filtrering
      setTasks(tasksWithUserInfo);
      
      // Filtrera uppgifter för initial visning baserat på showApproved och showRejected
      const initialFiltered = tasksWithUserInfo.filter(task => {
        if (task.status === TaskStatus.APPROVED) {
          return showApproved; // Visa godkända ENDAST om showApproved är true
        }
        if (task.status === TaskStatus.REJECTED) {
          return showRejected;
        }
        return true; // Visa alla andra uppgifter
      });
      
      setFilteredTasks(initialFiltered);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      setError('Kunde inte hämta väntande uppgifter');
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

    // Initialisera form state med uppgiftens värden
    setEditedTitle(task.title);

    // Hantera beskrivningen baserat på dess typ
    if (typeof task.description === 'object') {
      // Om vi har olika språkversioner, uppdatera alla språkfält
      const descObj = task.description as TaskDescription;
      setEditedDescriptionSv(descObj.sv || '');
      setEditedDescriptionEn(descObj.en || '');
      setEditedDescriptionPl(descObj.pl || '');
      setEditedDescriptionUk(descObj.uk || '');
      
      // Visa aktuellt språk i huvudbeskrivningsfältet
      const currentLang = i18n.language as keyof TaskDescription;
      setEditedDescription(descObj[currentLang] || descObj.sv || '');
    } else {
      // För bakåtkompatibilitet, om det bara finns en beskrivning
      setEditedDescription(task.description || '');
      setEditedDescriptionSv(task.description || '');
      setEditedDescriptionEn(task.description || '');
      setEditedDescriptionPl(task.description || '');
      setEditedDescriptionUk(task.description || '');
    }

    // Sätt status och prioritet
    setSelectedStatus(task.status);
    setSelectedPriority(task.priority);
    
    // Hantera datum
    setSelectedDueDate(task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '');
    
    // Sätt tilldelad användare om den finns
    setSelectedUserId(task.assignedTo?.id || '');
    
    // Öppna editerings-modalen
    setIsEditModalOpen(true);
  };

  // Ny funktion för att avvisa en pending task
  const rejectPendingTask = async () => {
    if (!selectedTask) return;

    try {
      await taskApi.rejectPendingTask(selectedTask.id);

      // Ta bort uppgiften från listan
      setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
      setFilteredTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));

      setIsEditModalOpen(false);
      showNotification('success', t('notifications.taskRejected'));
    } catch (err) {
      console.error('Failed to reject pending task:', err);
      showNotification('error', t('errors.rejectionFailed'));
    }
  };

  // Show notification helper
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({
      isVisible: true,
      type,
      message
    });
  };

  // Close notification helper
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Ny funktion för att godkänna en pending task
  const approvePendingTask = async () => {
    if (!selectedTask || !selectedUserId) return;

    try {
      // Tilldela användaren först om det behövs
      if (selectedUserId !== (selectedTask.assignedTo?.id || '')) {
        // Anropa assign internt i metoden för att undvika oanvänd funktion
        try {
          await taskApi.assignPendingTask(selectedTask.id, selectedUserId);
        } catch (err) {
          console.error('Failed to assign user to pending task:', err);
          showNotification('error', t('errors.assignmentFailed'));
          return;
        }
      }

      await taskApi.approvePendingTask(
        selectedTask.id,
        selectedUserId,
        selectedUserId, // Använd samma ID som för assignedToUserId som en temporär lösning
        selectedDueDate ? new Date(selectedDueDate) : null
      );

      // Ta bort uppgiften från listan
      setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
      setFilteredTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));

      setIsEditModalOpen(false);
      showNotification('success', t('notifications.taskApproved'));
    } catch (err) {
      console.error('Failed to approve task:', err);
      showNotification('error', t('errors.approvalFailed'));
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
        {t(`task.priorities.${priority.toLowerCase()}`)}
      </span>
    );
  };

  // Helper för att visa status med färg
  const renderStatusBadge = (status: TaskStatus) => {
    const colorMap: Record<string, string> = {
      [TaskStatus.PENDING]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [TaskStatus.NOT_FEASIBLE]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [TaskStatus.APPROVED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      [TaskStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>
        {t(`task.status.${status.toLowerCase().replace('_', '')}`)}
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
        console.log('- AssignedToUserId:', task.assignedToUserId);
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

  // Uppdatera pending task med nya värden inklusive dueDate
  const updatePendingTask = async () => {
    if (!selectedTask) return;

    try {
      // Skapa en TaskDescription med alla språkversioner
      const descriptionObj: TaskDescription = {
        sv: editedDescriptionSv,
        en: editedDescriptionEn,
        pl: editedDescriptionPl,
        uk: editedDescriptionUk
      };

      const pendingTaskData = {
        title: editedTitle,
        description: descriptionObj,
        status: selectedStatus,
        priority: selectedPriority,
        dueDate: selectedDueDate ? new Date(selectedDueDate) : null
      };

      await taskApi.updatePendingTask(selectedTask.id, pendingTaskData);

      // Uppdatera uppgiften i listan
      const updatedTask = {
        ...selectedTask,
        title: editedTitle,
        description: descriptionObj,
        status: selectedStatus,
        priority: selectedPriority,
        dueDate: selectedDueDate
      };

      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      setFilteredTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));

      setIsEditModalOpen(false);
      showNotification('success', t('pendingTasks.taskUpdated'));
    } catch (err) {
      console.error('Failed to update pending task:', err);
      showNotification('error', t('errors.updateFail'));
    }
  };

  // Uppdatera getTaskOpacity för att hantera godkända och avvisade uppgifter korrekt
  const getTaskOpacity = (task: Task) => {
    // Om approved eller rejected status, visa med 50% opacitet
    if (task.status === TaskStatus.APPROVED || task.status === TaskStatus.REJECTED) {
      return 'opacity-50';
    }
    
    // Alla andra uppgifter visas med full opacitet
    return 'opacity-100';
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
          {t('common.tryAgain')}
        </Button>
        <Button 
          onClick={fetchSpecificPendingTask} 
          className="mt-2 bg-yellow-500 hover:bg-yellow-600"
        >
          {t('common.tryAgain')} (67bdb085b526ba5619e3b3d1)
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('pendingTasks.title')}</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              const newShowApproved = !showApproved;
              setShowApproved(newShowApproved);
              const filtered = tasks.filter(task => {
                if (task.status === TaskStatus.APPROVED) {
                  return newShowApproved;
                }
                if (task.status === TaskStatus.REJECTED) {
                  return showRejected;
                }
                return true;
              });
              setFilteredTasks(filtered);
              console.log('Toggle approved, new filtered tasks:', filtered);
            }}
            className={`px-4 py-2 rounded-md ${
              showApproved 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showApproved ? t('common.hide') + ' ' + t('task.status.approved').toLowerCase() : t('common.show') + ' ' + t('task.status.approved').toLowerCase()}
          </button>
          <button
            onClick={() => {
              const newShowRejected = !showRejected;
              setShowRejected(newShowRejected);
              const filtered = tasks.filter(task => {
                if (task.status === TaskStatus.APPROVED) {
                  return showApproved;
                }
                if (task.status === TaskStatus.REJECTED) {
                  return newShowRejected;
                }
                return true;
              });
              setFilteredTasks(filtered);
              console.log('Toggle rejected, new filtered tasks:', filtered);
            }}
            className={`px-4 py-2 rounded-md ${
              showRejected 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showRejected ? t('common.hide') + ' ' + t('task.status.rejected').toLowerCase() : t('common.show') + ' ' + t('task.status.rejected').toLowerCase()}
          </button>
        </div>
      </div>

      {/* Sökfält */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('pendingTasks.search')}
          className="w-full p-2 border rounded"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabell */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">{t('common.title')}</th>
              <th className="px-4 py-2 text-left">{t('common.description')}</th>
              <th className="px-4 py-2 text-center">{t('common.status')}</th>
              <th className="px-4 py-2 text-center">{t('common.priority')}</th>
              <th className="px-4 py-2 text-right">{t('common.assignedTo')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`border-t border-border hover:bg-muted/50 cursor-pointer ${getTaskOpacity(task)}`}
              >
                <td className="px-4 py-2 text-sm text-card-foreground font-medium">{task.title}</td>
                <td className="px-4 py-2 text-sm text-card-foreground">
                  <div className="max-w-xs truncate">{task.description || '-'}</div>
                </td>
                <td className="px-4 py-2 text-sm">
                  {renderStatusBadge(task.status)}
                </td>
                <td className="px-4 py-2 text-sm">
                  {renderPriorityBadge(task.priority)}
                </td>
                <td className="px-4 py-2 text-sm text-card-foreground">
                  {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : t('task.unassigned')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Notification component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
        autoHideDuration={1500}
      />

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
              variant="outline"
              onClick={updatePendingTask}
            >
              {t('common.save')}
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
        <div className="grid grid-cols-1 gap-4">
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
          
          {/* Beskrivningar på olika språk */}
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-md font-medium">{t('tasks.description')}</h3>
            
            {/* Svenska beskrivningen */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('userManagement.languages.sv')}
              </label>
              <textarea
                value={editedDescriptionSv}
                onChange={(e) => setEditedDescriptionSv(e.target.value)}
                className="w-full min-h-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground dark:bg-card dark:text-card-foreground"
                placeholder={t('task.details.noDescription')}
              />
            </div>
            
            {/* Engelska beskrivningen */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('userManagement.languages.en')}
              </label>
              <textarea
                value={editedDescriptionEn}
                onChange={(e) => setEditedDescriptionEn(e.target.value)}
                className="w-full min-h-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground dark:bg-card dark:text-card-foreground"
                placeholder={t('task.details.noDescription')}
              />
            </div>
            
            {/* Polska beskrivningen */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('userManagement.languages.pl')}
              </label>
              <textarea
                value={editedDescriptionPl}
                onChange={(e) => setEditedDescriptionPl(e.target.value)}
                className="w-full min-h-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground dark:bg-card dark:text-card-foreground"
                placeholder={t('task.details.noDescription')}
              />
            </div>
            
            {/* Ukrainska beskrivningen */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('userManagement.languages.uk')}
              </label>
              <textarea
                value={editedDescriptionUk}
                onChange={(e) => setEditedDescriptionUk(e.target.value)}
                className="w-full min-h-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground dark:bg-card dark:text-card-foreground"
                placeholder={t('task.details.noDescription')}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {t('common.priority')}
              </label>
              <Select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as TaskPriority)}
                className="w-full"
              >
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {t(`task.priorities.${priority.toLowerCase()}`)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('task.details.dueDate')}
            </label>
            <Input
              type="date"
              value={selectedDueDate}
              onChange={(e) => setSelectedDueDate(e.target.value)}
              className="w-full"
            />
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