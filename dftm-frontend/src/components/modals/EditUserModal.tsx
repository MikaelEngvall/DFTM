import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
  isDarkMode: boolean;
}

export const EditUserModal = ({ user, onClose, onSave, isDarkMode }: EditUserModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/v1/users/${user.id}`, 
        { name, email, role },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
      setError(t('editUser.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg ${isDarkMode ? 'bg-[#1a2332]' : 'bg-white'} p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('editUser.title')}</h2>
          <button 
            onClick={onClose}
            className={`text-gray-400 hover:text-gray-500`}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {t('editUser.updateError')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('editUser.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                isDarkMode 
                  ? 'bg-[#2c3b52] border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('editUser.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                isDarkMode 
                  ? 'bg-[#2c3b52] border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('editUser.role')}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                isDarkMode 
                  ? 'bg-[#2c3b52] border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="USER">{t('editUser.roles.user')}</option>
              <option value="ADMIN">{t('editUser.roles.admin')}</option>
              <option value="SUPERADMIN">{t('editUser.roles.superadmin')}</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-gray-200 hover:bg-gray-300'
              } text-sm font-medium`}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? t('editUser.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 