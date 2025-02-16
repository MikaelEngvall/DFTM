import { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from '../types';
import { TaskModal } from './modals/TaskModal';
import { CreateTaskModal } from './modals/CreateTaskModal';
import { useTranslation } from 'react-i18next';

export const Calendar = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { t, i18n } = useTranslation();
  const [approvedTasks, setApprovedTasks] = useState<Task[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
    showCompleted: false
  });

  const languages = [
    { code: 'gb', flag: '🇬🇧' },
    { code: 'pl', flag: '🇵🇱' },
    { code: 'se', flag: '🇸🇪' },
    { code: 'ua', flag: '🇺🇦' }
  ];

  useEffect(() => {
    fetchApprovedTasks();
  }, [currentMonth]);

  const fetchApprovedTasks = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get<Task[]>('http://localhost:8080/api/v1/tasks/status/APPROVED', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched tasks:', response.data);
      setApprovedTasks(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch approved tasks:', error);
      setError('Kunde inte hämta godkända uppgifter');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendarHeader = () => (
    <div className={`${isDarkMode ? 'bg-[#1f2937]' : 'bg-gray-100'} p-4 rounded-t-lg`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevMonth} className={`${isDarkMode ? 'text-white' : 'text-gray-700'} hover:text-blue-400`}>
            ←
          </button>
          <h2 className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatMonth(currentMonth)}
          </h2>
          <button onClick={handleNextMonth} className={`${isDarkMode ? 'text-white' : 'text-gray-700'} hover:text-blue-400`}>
            →
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <label className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span>{t('calendar.showArchived')}</span>
          </label>
          <button className={`${
            isDarkMode 
              ? 'bg-[#2c3b52] hover:bg-[#374760]' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white px-4 py-2 rounded font-medium shadow-sm`}>
            + {t('calendar.newTask')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className={`${isDarkMode ? 'bg-[#1f2937]' : 'bg-gray-100'} p-4 mb-4 rounded-lg`}>
      <div className="flex space-x-4">
        <div>
          <label className="text-gray-400 block mb-1">{t('calendar.assignedTo')}</label>
          <select
            value={filters.assignee}
            onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
            className="bg-[#2c3b52] text-white rounded px-3 py-2"
          >
            <option value="">{t('calendar.all')}</option>
            {/* Lägg till assignees dynamiskt */}
          </select>
        </div>
        <div>
          <label className="text-gray-400 block mb-1">{t('calendar.priority')}</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-[#2c3b52] text-white rounded px-3 py-2"
          >
            <option value="">{t('calendar.all')}</option>
            <option value="HIGH">{t('calendar.high')}</option>
            <option value="MEDIUM">{t('calendar.medium')}</option>
            <option value="LOW">{t('calendar.low')}</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={filters.showCompleted}
              onChange={(e) => setFilters({ ...filters, showCompleted: e.target.checked })}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span>{t('calendar.showCompleted')}</span>
          </label>
        </div>
      </div>
    </div>
  );

  const getTasksForDay = (day: number) => {
    if (!approvedTasks) return [];
    
    return approvedTasks.filter(task => {
      if (!task.createdAt) return false;
      
      const taskDate = new Date(task.createdAt);
      return taskDate.getDate() === day &&
             taskDate.getMonth() === currentMonth.getMonth() &&
             taskDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const filterTasks = (tasks: Task[]) => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (!task) return false;
      if (filters.assignee && task.assignee !== filters.assignee) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (!filters.showCompleted && task.status === 'COMPLETED') return false;
      return true;
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Konvertera från söndag-baserad vecka (0-6) till måndag-baserad (0-6)
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOffset = getFirstDayOfMonth(currentMonth);
    const totalDays = firstDayOffset + daysInMonth;
    const totalCells = Math.ceil(totalDays / 7) * 7; // Runda upp till närmaste multipel av 7

    return (
      <div className={`${
        isDarkMode ? 'bg-[#1a2332]' : 'bg-white'
      } p-4 rounded-b-lg border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map(day => (
            <div key={day} className={`text-center p-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm font-medium`}>
              {day}
            </div>
          ))}
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNumber = i - firstDayOffset + 1;
            const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
            
            if (!isValidDay) {
              return (
                <div
                  key={i}
                  className="aspect-square p-2 border border-[#1a2332] bg-[#1a2332]"
                />
              );
            }

            const dayTasks = getTasksForDay(dayNumber);
            const filteredTasks = filterTasks(dayTasks);
            
            return (
              <div
                key={i}
                className={`aspect-square p-2 border ${
                  isDarkMode 
                    ? 'border-[#2c3b52] hover:bg-[#2c3b52]' 
                    : 'border-gray-200 hover:bg-gray-50'
                } transition-colors cursor-pointer`}
                onClick={() => handleDayClick(dayNumber)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-[#2c3b52]');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-[#2c3b52]');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-[#2c3b52]');
                  const taskId = e.dataTransfer.getData('text/plain');
                  const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                  handleTaskDrop(taskId, newDate);
                }}
              >
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  {dayNumber}
                </div>
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id);
                    }}
                    className={`mt-1 p-1 rounded cursor-pointer 
                      ${task.priority === 'HIGH' ? 'bg-red-500' : 
                        task.priority === 'MEDIUM' ? 'bg-[#f59e0b]' : 'bg-green-500'} 
                      text-black text-xs hover:opacity-90`}
                    onClick={(e) => handleTaskClick(task, e)}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="text-[10px] truncate">{task.assignee || t('calendar.unassigned')}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/v1/tasks/${taskId}/status`, { 
        status: newStatus 
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchApprovedTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleTaskDrop = async (taskId: string, newDate: Date) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/v1/tasks/${taskId}/date`, {
        newDate: newDate.toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchApprovedTasks();
    } catch (error) {
      console.error('Failed to update task date:', error);
    }
  };

  const weekdays = [
    t('calendar.weekdays.monday'),
    t('calendar.weekdays.tuesday'),
    t('calendar.weekdays.wednesday'),
    t('calendar.weekdays.thursday'),
    t('calendar.weekdays.friday'),
    t('calendar.weekdays.saturday'),
    t('calendar.weekdays.sunday')
  ];

  return (
    <div className={`container mx-auto p-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {renderCalendarHeader()}
      {renderFilters()}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-[#1a2332] rounded-b-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : error ? (
        <div className="bg-[#1a2332] p-4 text-red-500 text-center rounded-b-lg">{error}</div>
      ) : (
        renderCalendarGrid()
      )}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(status) => handleStatusChange(selectedTask.id, status)}
        />
      )}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={fetchApprovedTasks}
          selectedDate={selectedDate || undefined}
        />
      )}
    </div>
  );
}; 