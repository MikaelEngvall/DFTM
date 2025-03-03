import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { User } from '../types/user';
import { userApi } from '../services/api/userApi';
import { taskApi } from '../services/api/taskApi';
import { useTranslation } from 'react-i18next';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  currentUserId: string;
  selectedDate: Date;
  userRole: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  currentUserId,
  selectedDate,
  userRole
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Kontrollera om användaren är admin
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN';

  // Hämta användare när modalen öppnas
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchCurrentUser();
    }
  }, [isOpen, currentUserId]);

  // Hämta information om den inloggade användaren
  const fetchCurrentUser = async () => {
    try {
      const user = await userApi.getUserById(currentUserId);
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  // Hämta aktiva användare
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUserError(null);
      const allUsers = await userApi.getUsers();
      // Filtrera bort inaktiva användare
      const activeUsers = allUsers.filter(user => user.active !== false);
      
      // Om användaren är admin, visa alla användare, annars bara sig själv
      if (isAdmin) {
        setUsers(activeUsers);
      } else {
        // För vanliga användare, visa bara dem själva som alternativ
        const currentUser = activeUsers.find(user => user.id === currentUserId);
        setUsers(currentUser ? [currentUser] : []);
        // Automatiskt sätt assignedTo till den inloggade användaren
        if (currentUser) {
          setAssignedTo(currentUser.id);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUserError('Kunde inte hämta användare');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Återställ formuläret
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(TaskPriority.MEDIUM);
    setAssignedTo('');
    setError(null);
  };

  // Hantera formulärinlämning
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('En titel måste anges');
      return;
    }

    if (!assignedTo) {
      setError('Du måste tilldela uppgiften till en användare');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Hitta den tilldelade användaren
      const assignedUser = users.find(user => user.id === assignedTo);
      if (!assignedUser) {
        setError('Kunde inte hitta vald användare');
        setIsLoading(false);
        return;
      }
      
      // Förbered uppgiftsobjektet
      const newTask = {
        title,
        description,
        status: TaskStatus.PENDING,
        priority,
        assignedTo: assignedUser,
        assigner: currentUser || undefined,
        dueDate: `${selectedDate.toISOString().split('T')[0]}T12:00:00`, // Format: YYYY-MM-DDT12:00:00
        approved: true,
      };
      
      // Skicka API-anrop för att skapa uppgift
      const createdTask = await taskApi.createTask(newTask);
      
      // Meddela föräldrakomponenten om framgång
      onTaskCreated(createdTask);
      
      // Återställ formuläret och stäng modalen
      resetForm();
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid skapande av uppgift');
      console.error('Error creating task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Visa ingen modal om den inte är öppen
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('task.create.title')}</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Titel */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                {t('task.field.title')} *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded border border-input bg-card"
                placeholder={t('task.placeholder.title')}
                required
              />
            </div>
            
            {/* Beskrivning */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                {t('task.field.description')}
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-2 rounded border border-input bg-card"
                placeholder={t('task.placeholder.description')}
              />
            </div>
            
            {/* Prioritet */}
            <div className="mb-4">
              <label htmlFor="priority" className="block text-sm font-medium mb-1">
                {t('task.field.priority')}
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2 rounded border border-input bg-card"
              >
                <option value={TaskPriority.LOW}>{t('task.priority.low')}</option>
                <option value={TaskPriority.MEDIUM}>{t('task.priority.medium')}</option>
                <option value={TaskPriority.HIGH}>{t('task.priority.high')}</option>
                <option value={TaskPriority.URGENT}>{t('task.priority.urgent')}</option>
              </select>
            </div>
            
            {/* Tilldela till */}
            <div className="mb-4">
              <label htmlFor="assignedTo" className="block text-sm font-medium mb-1">
                {t('task.field.assignedTo')} *
              </label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2 rounded border border-input bg-card"
                required
                disabled={isLoadingUsers || !isAdmin}
              >
                <option value="">{t('task.placeholder.selectUser')}</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              {isLoadingUsers && <p className="text-sm text-muted-foreground mt-1">{t('common.loading')}</p>}
              {userError && <p className="text-sm text-destructive mt-1">{userError}</p>}
            </div>
            
            {/* Felmeddelande */}
            {error && (
              <div className="mb-4 p-2 bg-destructive/10 border border-destructive text-destructive rounded">
                {error}
              </div>
            )}
            
            {/* Knappar */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-4 py-2 border rounded-md text-sm font-medium bg-card hover:bg-accent"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? t('common.creating') : t('task.create.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 