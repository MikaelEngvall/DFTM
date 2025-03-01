import { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, taskApi } from '../services/api/taskApi';
import { userApi } from '../services/api/userApi';
import { User } from '../types/user';
import { useTranslation } from 'react-i18next';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onTaskCreated: (task: Task) => void;
  currentUserId: string;
}

export const CreateTaskModal = ({ 
  isOpen, 
  onClose, 
  selectedDate,
  onTaskCreated,
  currentUserId
}: CreateTaskModalProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assignedTo, setAssignedTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Hämta alla användare när modalen öppnas
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Hämta användarlistan
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUserError(null);
      
      // Använd getUsers istället för getAllUsers eftersom den gör korrekt mappning
      const userList = await userApi.getUsers();
      console.log('Hämtade användare:', userList);
      
      // Filtrera ut aktiva användare
      const activeUsers = userList.filter(user => user.isActive !== false);
      console.log('Aktiva användare:', activeUsers);
      
      setUsers(activeUsers);
      
      if (activeUsers.length === 0) {
        setUserError('Inga aktiva användare hittades. Kontakta systemadministratören.');
      }
    } catch (err) {
      console.error('Fel vid hämtning av användare:', err);
      setUserError('Kunde inte hämta användarlistan. Försök igen senare.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Reset form när modalen stängs
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
      
      // Förbered uppgiftsobjektet
      const newTask = {
        title,
        description,
        status: TaskStatus.PENDING,
        priority,
        assignedTo,
        assigner: currentUserId,
        dueDate: selectedDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        archived: false,
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

  // Prioritetsalternativ
  const priorityOptions = [
    { value: TaskPriority.LOW, label: t('task.priority.low') },
    { value: TaskPriority.MEDIUM, label: t('task.priority.medium') },
    { value: TaskPriority.HIGH, label: t('task.priority.high') },
    { value: TaskPriority.URGENT, label: t('task.priority.urgent') }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg w-full max-w-md">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t('task.create.title')}</h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/20 text-destructive border border-destructive rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              {t('task.create.titleLabel')}*
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded border border-input bg-card"
              placeholder={t('task.create.titlePlaceholder')}
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              {t('task.create.descriptionLabel')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded border border-input bg-card min-h-[100px]"
              placeholder={t('task.create.descriptionPlaceholder')}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              {t('task.create.priorityLabel')}
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full p-2 rounded border border-input bg-card"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium mb-1">
              {t('task.create.assignedToLabel')}*
            </label>
            {isLoadingUsers ? (
              <div className="flex items-center space-x-2 p-2">
                <div className="animate-spin h-4 w-4 border-t-2 border-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
              </div>
            ) : userError ? (
              <div className="p-3 bg-destructive/20 text-destructive border border-destructive rounded-md text-sm">
                {userError}
              </div>
            ) : (
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2 rounded border border-input bg-card"
                required
              >
                <option value="">{t('task.create.assignToPlaceholder')}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              {t('task.create.dueDateLabel')}
            </label>
            <div className="p-2 border border-input bg-muted/30 rounded">
              {selectedDate.toLocaleDateString('sv-SE')}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              disabled={isLoading || isLoadingUsers || !!userError || users.length === 0}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.saving')}
                </span>
              ) : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 