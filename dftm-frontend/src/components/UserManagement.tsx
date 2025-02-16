import { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

interface UserManagementProps {
  isDarkMode: boolean;
}

export const UserManagement = ({ isDarkMode }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>('/api/v1/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">Användarhantering</h1>
      {/* Användarhantering kommer här */}
    </div>
  );
}; 