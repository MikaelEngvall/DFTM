import { useState, useEffect } from 'react';
import { Task, TaskStatus, taskApi } from '../services/api/taskApi';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskModal } from './CreateTaskModal';
import { useTranslation } from 'react-i18next';

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
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userTasks = await taskApi.getTasksByUser(userId);
        setTasks(userTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av uppgifter');
        console.error('Error fetching tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

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
    if (isAdmin) {
      setSelectedDate(date);
      setIsCreateTaskModalOpen(true);
    }
  };

  // Funktion för att hantera när en ny uppgift skapats
  const handleTaskCreated = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
  };

  // Funktion för att uppdatera uppgiftsstatus
  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = await taskApi.updateTaskStatus(taskId, newStatus);
      
      // Uppdatera uppgiftslistan
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      
      // Uppdatera den valda uppgiften om den är öppen
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Funktion för att lägga till kommentar
  const handleAddComment = async (taskId: string, commentText: string) => {
    try {
      await taskApi.addComment(taskId, commentText);
      
      // Hämta den uppdaterade uppgiften med nya kommentarer
      const updatedTask = await taskApi.getTaskById(taskId);
      
      // Uppdatera uppgiftslistan
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      
      // Uppdatera den valda uppgiften om den är öppen
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
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
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        <p>{error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          {t('common.loading')}
        </button>
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
            {day}
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
                        className={`text-xs p-1 rounded cursor-pointer truncate ${
                          task.priority === 'URGENT' 
                            ? 'bg-destructive/60 text-destructive-foreground' 
                            : task.priority === 'HIGH' 
                              ? 'bg-amber-500/60 text-amber-950' 
                              : task.status === 'COMPLETED' 
                                ? 'bg-green-500/60 text-green-950' 
                                : 'bg-primary/60 text-primary-foreground'
                        }`}
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