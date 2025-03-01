import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUserPlus } from 'react-icons/fi';
import { User } from '../types/user';
import { EditUserModal } from './EditUserModal';
import { CreateUserModal } from './CreateUserModal';

interface UserManagementTableProps {
  users: User[];
  onUserUpdate: (user: User) => void;
  onUserCreate: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const UserManagementTable = ({ users, onUserUpdate, onUserCreate }: UserManagementTableProps) => {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (updatedUser: User) => {
    onUserUpdate(updatedUser);
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleCreateUser = (newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    onUserCreate(newUser);
    setIsCreateModalOpen(false);
  };

  // Filtrera användare baserat på aktiv status
  const filteredUsers = showInactive 
    ? users 
    : users.filter(user => user.isActive);

  return (
    <div className="bg-[#1c2533] rounded-lg shadow-xl overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium leading-6 text-white">{t('userManagement.title')}</h3>
          <div className="flex items-center">
            <input
              id="showInactive"
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showInactive" className="text-sm text-gray-300">
              {t('userManagement.showInactive')}
            </label>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2"
        >
          <FiUserPlus className="h-5 w-5" />
          {t('userManagement.createUser.button')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('userManagement.table.firstName')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('userManagement.table.lastName')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('userManagement.table.phoneNumber')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('userManagement.table.role')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-700/50 cursor-pointer ${!user.isActive ? 'opacity-50' : ''}`}
                onClick={() => handleEditUser(user)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.phoneNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {t(`userManagement.roles.${user.role}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSave={handleUpdateUser}
        />
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
}; 