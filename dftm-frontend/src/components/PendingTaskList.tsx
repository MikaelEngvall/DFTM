import { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from '../types';
import { useTranslation } from 'react-i18next';

interface PendingTaskListProps {
  isDarkMode: boolean;
}

export const PendingTaskList = ({ isDarkMode }: PendingTaskListProps) => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPendingTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<PendingTask[]>(
          'http://localhost:8080/api/v1/tasks/pending',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch pending tasks:', error);
        setError('Failed to load pending tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingTasks();
  }, []);

  const handleApprove = async (taskId: string) => {
    try {
      await axios.post(`http://localhost:8080/api/v1/tasks/${taskId}/approve`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to approve task:', error);
      setError('Failed to approve task');
    }
  };

  const handleReject = async (taskId: string) => {
    try {
      await axios.post(`http://localhost:8080/api/v1/tasks/${taskId}/reject`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to reject task:', error);
      setError('Failed to reject task');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {t('pendingTasks.title')}
      </h2>

      {tasks.length === 0 ? (
        <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('pendingTasks.noTasks')}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`rounded-lg shadow-lg overflow-hidden ${
                isDarkMode ? 'bg-[#1a2332] border border-gray-700' : 'bg-white'
              }`}
            >
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {task.description}
                </p>
                <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>{t('pendingTasks.reporter')}: {task.reporter}</p>
                  <p>{t('pendingTasks.created')}: {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleApprove(task.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 
                             transition-colors duration-200"
                  >
                    {t('pendingTasks.approve')}
                  </button>
                  <button
                    onClick={() => handleReject(task.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 
                             transition-colors duration-200"
                  >
                    {t('pendingTasks.reject')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 