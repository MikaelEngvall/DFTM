import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { EditUserModal } from './modals/EditUserModal';
import { CreateUserModal } from './modals/CreateUserModal';
import { User } from '../types';

interface UserManagementProps {
  isDarkMode: boolean;
}

export const UserManagement = ({ isDarkMode }: UserManagementProps) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get<User[]>('http://localhost:8080/api/v1/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(t('userManagement.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/v1/users/${userId}/status`, 
        { active: !currentStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      setError(t('userManagement.updateError'));
    }
  };

  const filteredUsers = users.filter(user => showInactive || user.active);

  if (isLoading) return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 m-auto" />;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('userManagement.title')}
        </h1>
        
        <div className="flex items-center space-x-4">
          <label className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span>{t('userManagement.showInactive')}</span>
          </label>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            {t('userManagement.addUser')}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center p-4 bg-red-100 rounded mb-4">
          {error}
        </div>
      )}

      <div className={`overflow-x-auto rounded-lg ${isDarkMode ? 'bg-[#1a2332]' : 'bg-white'}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-[#1f2937]' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('userManagement.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('userManagement.email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('userManagement.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('userManagement.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('userManagement.actions')}
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {user.name}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'SUPERADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'ADMIN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'}`
                  }>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleStatusToggle(user.id, user.active)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}`
                    }
                  >
                    {user.active ? t('userManagement.active') : t('userManagement.inactive')}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {t('common.edit')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={fetchUsers}
          isDarkMode={isDarkMode}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSave={fetchUsers}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}; 