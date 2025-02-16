import { useState, useEffect } from 'react';
import axios from 'axios';
import { EditUserModal } from './modals/EditUserModal';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface UserListProps {
  isDarkMode: boolean;
}

export const UserList = ({ isDarkMode }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get<User[]>('http://localhost:8080/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Kunde inte hämta användare');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container mx-auto p-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-[#1a2332]' : 'bg-white shadow-lg'}`}>
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-[#1f2937]' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-xl font-semibold">Användare</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${isDarkMode ? 'bg-[#2c3b52]' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Namn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Roll</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Skapad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr 
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-[#2c3b52]' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={fetchUsers}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}; 