import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface CreateUserModalProps {
  onClose: () => void;
  onSave: () => void;
  isDarkMode: boolean;
}

export const CreateUserModal = ({ onClose, onSave, isDarkMode }: CreateUserModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError(t('createUser.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/v1/users', 
        { name, email, password, role },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
      setError(t('createUser.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg ${isDarkMode ? 'bg-[#1a2332]' : 'bg-white'} p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('createUser.title')}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('createUser.name')}
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
              {t('createUser.email')}
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
              {t('createUser.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {t('createUser.confirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {t('createUser.role')}
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
              <option value="USER">{t('createUser.roles.user')}</option>
              <option value="ADMIN">{t('createUser.roles.admin')}</option>
              <option value="SUPERADMIN">{t('createUser.roles.superadmin')}</option>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? t('createUser.creating') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 