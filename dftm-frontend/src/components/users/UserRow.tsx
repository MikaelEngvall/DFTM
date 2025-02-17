import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  active: boolean;
}

interface UserRowProps {
  user: User;
  onUpdate: () => void;
  isDarkMode: boolean;
}

export const UserRow = ({ user, isDarkMode }: UserRowProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <tr className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {t(`userList.roles.${user.role.toLowerCase()}`)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${user.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'}`}
        >
          {user.active ? t('userList.active') : t('userList.inactive')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {format(new Date(user.createdAt), 'yyyy-MM-dd')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('common.edit')}
        </button>
      </td>
    </tr>
  );
}; 