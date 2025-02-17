import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { EditUserModal } from './modals/EditUserModal';
import { CreateUserModal } from './modals/CreateUserModal';
import { User } from '../types';

interface UserListProps {
  isDarkMode: boolean;
}

export const UserList = ({ isDarkMode }: UserListProps) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        
        const response = await axios.get<User[]>('http://localhost:8080/api/v1/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data);
      } catch (error: any) {
        console.error('Failed to fetch users:', error.response?.status, error.response?.data);
        setError(t('userList.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredUsers = users.filter(user => showInactive || user.active);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('userList.title')}
        </h1>
        
        <div className="flex items-center space-x-4">
          <label className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span>{t('userList.showInactive')}</span>
          </label>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('userList.addNew')}</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-red-500 text-center p-4 bg-red-100 rounded">
          {error}
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg ${isDarkMode ? 'bg-[#1a2332]' : 'bg-white'}`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-[#1f2937]' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  {t('userList.name')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  {t('userList.email')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  {t('userList.role')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  {t('userList.status')}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  {t('userList.created')}
                </th>
                <th className="px-6 py-3 relative">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200 text-gray-900'
            }`}>
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`
                    ${isDarkMode ? 'hover:bg-[#2c3b52]' : 'hover:bg-gray-50'}
                    ${!user.active ? 'opacity-60' : ''}
                    cursor-pointer
                  `}
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'SUPERADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'ADMIN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                      {t(`userList.roles.${user.role.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {user.active ? t('userList.active') : t('userList.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(user);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {t('common.edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={() => {}}
          isDarkMode={isDarkMode}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => {}}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}; 