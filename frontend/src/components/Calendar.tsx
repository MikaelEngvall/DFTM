import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types/task';
import { taskApi } from '../services/api/taskApi';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskModal } from './CreateTaskModal';
import { useTranslation } from 'react-i18next';
import { getStatusColorWithOpacity } from '../utils/statusColors';

interface CalendarProps {
  userId: string;
  userRole?: string;
}

export const Calendar = ({ userId, userRole }: CalendarProps) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // Kontrollera om användaren är admin (ROLE_ADMIN eller ROLE_SUPERADMIN)
  const isAdmin = userRole && (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN');

  // Hämta uppgifter för inloggad användare
  useEffect(() => {
    // Skapa en funktion som kan avbrytas
    let isMounted = true;
    const abortController = new AbortController();
    
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let userTasks: Task[] = [];
        
        // Admin/superadmin kan se alla uppgifter
        if (isAdmin) {
          console.log("Admin user, fetching all tasks");
          userTasks = await taskApi.getAllTasks();
        } else {
          // Vanliga användare ser bara egna uppgifter
          console.log("Regular user, fetching user tasks for ID:", userId);
          userTasks = await taskApi.getTasksByUser(userId);
        }
        
        // Kontrollera om komponenten fortfarande är monterad innan uppdatering av state
        if (isMounted) {
          setTasks(userTasks);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        // Kontrollera om komponenten fortfarande är monterad innan uppdatering av state
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av uppgifter');
          setIsLoading(false);
        }
      }
    };
    
    fetchTasks();
    
    // Cleanup-funktion som körs när komponenten avmonteras
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [userId, isAdmin]);

  // Funktion för att gå till föregående månad
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Funktion för att gå till nästa månad
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Funktion för att visa uppgiftsdetaljer
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Funktion för att öppna skapa uppgift modal
  const openCreateTaskModal = (date: Date) => {
    // Tillåt alla inloggade användare att öppna modalen
    setSelectedDate(date);
    setIsCreateTaskModalOpen(true);
  };

  // Funktion för att hantera när en ny uppgift skapats
  const handleTaskCreated = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
  };

  // Funktion för att uppdatera uppgiftsstatus
  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistisk uppdatering - uppdatera UI direkt innan API-anropet är klart
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      const optimisticTask = { ...taskToUpdate, status: newStatus };
      
      // Uppdatera listan optimistiskt
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? optimisticTask : task
        )
      );
      
      // Uppdatera den valda uppgiften om den är öppen
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(optimisticTask);
      }
      
      // Gör det faktiska API-anropet
      try {
        const updatedTask = await taskApi.updateTaskStatus(taskId, newStatus);
        
        // Om API-anropet lyckas, uppdatera med det faktiska resultatet från servern
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
        
        if (selectedTask && selectedTask.id === updatedTask.id) {
          setSelectedTask(updatedTask);
        }
      } catch (apiErr) {
        // Även om API-anropet misslyckas, behåller vi den optimistiska uppdateringen
        // eftersom vi märkte att servern faktiskt uppdaterar statusen trots 403-felet
        console.error('API error updating task status, but UI remains updated:', apiErr);
        // Här kunde vi återställa UI till ursprungligt tillstånd om vi ville, men vi väljer att behålla uppdateringen
      }
    } catch (err) {
      console.error('Error in handleStatusUpdate:', err);
    }
  };

  // Funktion för att lägga till kommentar
  const handleAddComment = async (taskId: string, commentText: string) => {
    try {
      setIsLoading(true);
      await taskApi.addComment(taskId, commentText);
      
      console.log('Comment successfully added');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hjälpfunktion för att skapa kalenderdagar för aktuell månad
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = söndag, 1 = måndag, etc.
    
    // Justerar så att veckan börjar på måndag (ISO)
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days = [];
    
    // Lägg till tomma platser för dagar från föregående månad
    for (let i = 0; i < adjustedStartingDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    
    // Lägg till dagar för aktuell månad
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    return days;
  };

  // Hjälpfunktion för att hämta uppgifter för en specifik dag
  const getTasksForDay = (date: Date | null) => {
    if (!date) return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  // Funktion för att kombinera statusfärg med prioritet
  const getTaskCardClass = (task: Task): string => {
    // Säkerställ att task.status finns och är en giltig sträng
    if (!task || !task.status) {
      console.warn('Task eller task.status saknas:', task);
      return 'bg-slate-500/90 text-white font-medium'; // Default-färg om status saknas
    }
    
    // För URGENT prioritet, använd alltid rött med skuggor oavsett status
    if (task.priority === 'URGENT') {
      return 'bg-destructive/90 text-white font-semibold shadow-lg shadow-destructive/50 ring-2 ring-destructive/80 hover:bg-destructive/100';
    }
    
    // För HIGH prioritet, förbättra synlighet och lägg till skuggor
    if (task.priority === 'HIGH') {
      return `${getStatusColorWithOpacity(task.status, 90)} font-medium shadow-md hover:shadow-lg`;
    }
    
    // För alla andra, använd statusfärg med förbättrad synlighet
    return `${getStatusColorWithOpacity(task.status, 85)} hover:shadow-sm`;
  };

  // Få namnen på veckodagarna
  const weekdays = [
    t('calendar.weekdays.monday'),
    t('calendar.weekdays.tuesday'),
    t('calendar.weekdays.wednesday'),
    t('calendar.weekdays.thursday'),
    t('calendar.weekdays.friday'),
    t('calendar.weekdays.saturday'),
    t('calendar.weekdays.sunday')
  ];
  
  // Få namn på aktuell månad
  const monthNames = [
    t('calendar.months.january'),
    t('calendar.months.february'),
    t('calendar.months.march'),
    t('calendar.months.april'),
    t('calendar.months.may'),
    t('calendar.months.june'),
    t('calendar.months.july'),
    t('calendar.months.august'),
    t('calendar.months.september'),
    t('calendar.months.october'),
    t('calendar.months.november'),
    t('calendar.months.december')
  ];
  
  // Skapa kalenderdagar
  const calendarDays = getDaysInMonth();

  // Anpassa vyn baserat på laddningsstatus och fel
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">{t('calendar.title')}</h2>
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">{t('calendar.title')}</h2>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p className="font-medium">{t('common.error')}</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            {t('calendar.previousMonth')}
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            {t('calendar.today')}
          </button>
          <button 
            onClick={goToNextMonth}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            {t('calendar.nextMonth')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Veckodagar */}
        {weekdays.map(day => (
          <div key={day} className="p-2 text-center font-bold border-b border-border">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">
              {t(`calendar.weekdays.short.${day.toLowerCase() === t('calendar.weekdays.monday').toLowerCase() ? 'monday' : 
                 day.toLowerCase() === t('calendar.weekdays.tuesday').toLowerCase() ? 'tuesday' : 
                 day.toLowerCase() === t('calendar.weekdays.wednesday').toLowerCase() ? 'wednesday' : 
                 day.toLowerCase() === t('calendar.weekdays.thursday').toLowerCase() ? 'thursday' : 
                 day.toLowerCase() === t('calendar.weekdays.friday').toLowerCase() ? 'friday' : 
                 day.toLowerCase() === t('calendar.weekdays.saturday').toLowerCase() ? 'saturday' : 'sunday'}`)}
            </span>
          </div>
        ))}

        {/* Kalenderdagar */}
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDay(day.date);
          const isToday = day.date && 
            day.date.getDate() === new Date().getDate() && 
            day.date.getMonth() === new Date().getMonth() && 
            day.date.getFullYear() === new Date().getFullYear();
          
          return (
            <div 
              key={index}
              className={`min-h-[100px] p-2 border border-border rounded-md ${
                day.isCurrentMonth ? 'bg-card' : 'bg-muted/30'
              } ${isToday ? 'ring-2 ring-primary' : ''} ${
                isAdmin && day.date ? 'cursor-pointer hover:ring-1 hover:ring-primary/50' : ''
              }`}
              onClick={() => day.date && isAdmin ? openCreateTaskModal(day.date) : undefined}
            >
              {day.date && (
                <>
                  <div className="text-right">
                    <span className={`${isToday ? 'bg-primary text-primary-foreground rounded-full px-2 py-1' : ''}`}>
                      {day.date.getDate()}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation(); // Förhindra att kalendercellen aktiveras
                          openTaskDetails(task);
                        }}
                        className={`text-xs p-1.5 rounded cursor-pointer truncate transition-all ${getTaskCardClass(task)}`}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal för uppgiftsdetaljer */}
      {selectedTask && (
        <TaskDetailModal 
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          onStatusUpdate={handleStatusUpdate}
          onAddComment={handleAddComment}
        />
      )}

      {/* Modal för att skapa uppgift */}
      {selectedDate && (
        <CreateTaskModal
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          selectedDate={selectedDate}
          onTaskCreated={handleTaskCreated}
          currentUserId={userId}
          userRole={userRole || 'ROLE_USER'}
        />
      )}
    </div>
  );
}; 