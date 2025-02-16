import { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from '../types';

export const PendingTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get<Task[]>('http://localhost:8080/api/v1/tasks/pending');
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pending Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No pending tasks</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">{task.title}</h3>
              <p className="text-gray-600 mt-2">{task.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Reporter: {task.reporter}</p>
                <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleApprove(task.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(task.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 