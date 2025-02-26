import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface ManageUsersProps {
  isDarkMode: boolean;
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const ManageUsers = ({ isDarkMode }: ManageUsersProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/v1/users', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
      // Visa success meddelande
    } catch (err) {
      setError(t('createUser.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {t('nav.manageUsers')}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('createUser.title')}
          </h2>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('createUser.name')}
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('createUser.email')}
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('createUser.password')}
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('createUser.role')}
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="USER">{t('createUser.roles.user')}</option>
                <option value="ADMIN">{t('createUser.roles.admin')}</option>
                <option value="SUPERADMIN">{t('createUser.roles.superadmin')}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md ${
                loading 
                  ? 'bg-gray-400' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium`}
            >
              {loading ? t('createUser.creating') : t('createUser.title')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 