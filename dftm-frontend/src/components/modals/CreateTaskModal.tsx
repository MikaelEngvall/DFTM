import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: () => void;
  selectedDate?: Date;
}

export const CreateTaskModal = ({ onClose, onTaskCreated, selectedDate }: CreateTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('/api/v1/tasks', {
        title,
        description,
        createdAt: selectedDate || new Date(),
        status: 'PENDING'
      });
      onTaskCreated();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to create task:', err);
      setError('Kunde inte skapa uppgiften');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1f2937] rounded-lg w-full max-w-lg p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Ny uppgift</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500 bg-opacity-10 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="text-gray-400 block mb-1">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#2c3b52] text-white rounded px-3 py-2 w-full"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Beskrivning</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#2c3b52] text-white rounded px-3 py-2 w-full h-32"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Skapar...' : 'Skapa uppgift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 