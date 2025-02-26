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
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await axios.get<User[]>('http://localhost:8080/api/v1/users', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Users response:', response.data); // För debugging
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('userManagement.title')}
        </h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
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
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('userList.addNew')}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center p-4 bg-red-100 rounded mb-4">
          {error}
        </div>
      )}

      <div className={`overflow-x-auto rounded-lg shadow ${isDarkMode ? 'bg-[#1a2332]' : 'bg-white'}`}>
        <div className="min-w-full divide-y divide-gray-200">
          <div className="hidden sm:grid sm:grid-cols-4 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700">
            <div className="text-xs font-medium text-gray-500 uppercase">{t('userManagement.name')}</div>
            <div className="text-xs font-medium text-gray-500 uppercase">{t('userManagement.email')}</div>
            <div className="text-xs font-medium text-gray-500 uppercase">{t('userManagement.role')}</div>
            <div className="text-xs font-medium text-gray-500 uppercase">{t('userManagement.status')}</div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <div 
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`cursor-pointer transition-colors duration-150 hover:bg-gray-50 
                  dark:hover:bg-gray-600 ${!user.active ? 'opacity-60' : ''}`}
              >
                <div className="sm:hidden p-4 space-y-2">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="flex justify-between items-center">
                    <span className={getRoleTagClass(user.role)}>{user.role}</span>
                    <span className={getStatusTagClass(user.active)}>
                      {user.active ? t('userManagement.active') : t('userManagement.inactive')}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:grid sm:grid-cols-4 gap-4 px-6 py-4">
                  <div>{user.name}</div>
                  <div>{user.email}</div>
                  <div>
                    <span className={getRoleTagClass(user.role)}>{user.role}</span>
                  </div>
                  <div>
                    <span className={getStatusTagClass(user.active)}>
                      {user.active ? t('userManagement.active') : t('userManagement.inactive')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

// Hjälpfunktioner för styling
const getRoleTagClass = (role: string) => {
  const baseClass = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  switch (role) {
    case 'SUPERADMIN':
      return `${baseClass} bg-purple-100 text-purple-800`;
    case 'ADMIN':
      return `${baseClass} bg-blue-100 text-blue-800`;
    default:
      return `${baseClass} bg-green-100 text-green-800`;
  }
};

const getStatusTagClass = (active: boolean) => {
  const baseClass = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  return active 
    ? `${baseClass} bg-green-100 text-green-800`
    : `${baseClass} bg-red-100 text-red-800`;
}; 