import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit2 } from 'react-icons/fi';
import { User } from '../types/user';
import { EditUserModal } from './EditUserModal';

interface UserManagementTableProps {
  users: User[];
  onUserUpdate: (user: User) => void;
}

export const UserManagementTable = ({ users, onUserUpdate }: UserManagementTableProps) => {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (updatedUser: User) => {
    onUserUpdate(updatedUser);
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="bg-[#1c2533] rounded-lg shadow-xl overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-white">{t('userManagement.title')}</h3>
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
                {t('userManagement.table.email')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('userManagement.table.role')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('userManagement.table.status')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                {t('userManagement.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-700/50 cursor-pointer"
                onClick={() => handleEditUser(user)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {t(`userManagement.roles.${user.role}`)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {t(user.isActive ? 'userManagement.status.active' : 'userManagement.status.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditUser(user);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <FiEdit2 className="h-5 w-5" />
                  </button>
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
    </div>
  );
}; 