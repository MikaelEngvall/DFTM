import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserRow } from './UserRow';
import { Spinner } from '../common/Spinner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  active: boolean;
}

interface UserListProps {
  isDarkMode: boolean;
}

export const UserList = ({ isDarkMode }: UserListProps) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/v1/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(t('userList.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = showInactive 
    ? users 
    : users.filter(user => user.active);

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('userList.title')}
        </h1>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2"
            />
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {t('userList.showInactive')}
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('userList.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('userList.email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('userList.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('userList.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t('userList.created')}
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <UserRow 
                key={user.id} 
                user={user} 
                onUpdate={fetchUsers}
                isDarkMode={isDarkMode}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 