import { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from '../types';
import { TaskModal } from './modals/TaskModal';
import { CreateTaskModal } from './modals/CreateTaskModal';

export const Calendar = () => {
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

  useEffect(() => {
    fetchApprovedTasks();
  }, [currentMonth]);

  const fetchApprovedTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Task[]>('http://localhost:8080/api/v1/tasks/status/APPROVED');
      console.log('Fetched tasks:', response.data); // För debugging
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

  const renderCalendarHeader = () => (
    <div className="bg-[#1f2937] p-4 rounded-t-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-white font-medium">{formatMonth(currentMonth)}</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span>VISA ARKIVERADE</span>
          </label>
          <button className="bg-[#2c3b52] text-white px-4 py-2 rounded hover:bg-[#374760]">
            + NY UPPGIFT
          </button>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-[#1f2937] p-4 mb-4 rounded-lg">
      <div className="flex space-x-4">
        <div>
          <label className="text-gray-400 block mb-1">Tilldelad till</label>
          <select
            value={filters.assignee}
            onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
            className="bg-[#2c3b52] text-white rounded px-3 py-2"
          >
            <option value="">Alla</option>
            {/* Lägg till assignees dynamiskt */}
          </select>
        </div>
        <div>
          <label className="text-gray-400 block mb-1">Prioritet</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-[#2c3b52] text-white rounded px-3 py-2"
          >
            <option value="">Alla</option>
            <option value="HIGH">Hög</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Låg</option>
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
            <span>Visa avslutade</span>
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

  const renderCalendarGrid = () => (
    <div className="bg-[#1a2332] p-4 rounded-b-lg">
      <div className="grid grid-cols-7 gap-1">
        {['MÅNDAG', 'TISDAG', 'ONSDAG', 'TORSDAG', 'FREDAG', 'LÖRDAG', 'SÖNDAG'].map(day => (
          <div key={day} className="text-center p-2 text-gray-400 text-sm font-medium">
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }, (_, i) => {
          const dayTasks = getTasksForDay(i + 1);
          const filteredTasks = filterTasks(dayTasks);
          
          return (
            <div
              key={i}
              className="aspect-square p-2 border border-[#2c3b52] hover:bg-[#2c3b52] transition-colors cursor-pointer"
              onClick={() => handleDayClick(i + 1)}
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
                const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                handleTaskDrop(taskId, newDate);
              }}
            >
              <div className="text-gray-400 text-sm">{i + 1}</div>
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
                  <div className="text-[10px] truncate">{task.assignee || 'Ej tilldelad'}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

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
      await axios.put(`/api/v1/tasks/${taskId}/status`, { status: newStatus });
      fetchApprovedTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleTaskDrop = async (taskId: string, newDate: Date) => {
    try {
      await axios.put(`/api/v1/tasks/${taskId}/date`, {
        newDate: newDate.toISOString()
      });
      fetchApprovedTasks();
    } catch (error) {
      console.error('Failed to update task date:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
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