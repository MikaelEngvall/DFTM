import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { userApi } from '../services/api/userApi';
import { UserManagementTable } from './UserManagementTable';
import { useTranslation } from 'react-i18next';

export const UserManagementPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedUsers = await userApi.getUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av användare');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      const updated = await userApi.updateUser(updatedUser);
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === updated.id ? updated : user))
      );
    } catch (err) {
      console.error('Error updating user:', err);
      // Här kan du lägga till felhantering/meddelanden
    }
  };

  const handleUserCreate = async (newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Validera token innan vi försöker skapa användaren
      const tokenStatus = userApi.validateToken();
      console.log('Token status innan försök att skapa användare:', tokenStatus);
      
      if (!tokenStatus.valid) {
        console.error(`Kan inte skapa användare - ogiltigt token: ${tokenStatus.reason}`);
        // Här kan du implementera ett visuellt felmeddelande till användaren
        return;
      }
      
      if (tokenStatus.role !== 'ROLE_SUPERADMIN') {
        console.error(`Kan inte skapa användare - fel roll: ${tokenStatus.role}, endast ROLE_SUPERADMIN kan skapa användare`);
        // Här kan du implementera ett visuellt felmeddelande till användaren
        return;
      }
      
      const created = await userApi.createUser(newUser);
      setUsers(prevUsers => [...prevUsers, created]);
    } catch (err) {
      console.error('Error creating user:', err);
      // Här kan du lägga till felhantering/meddelanden
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">{t('users.management')}</h2>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <UserManagementTable 
          users={users} 
          onUserUpdate={handleUserUpdate}
          onUserCreate={handleUserCreate}
        />
      )}
    </div>
  );
}; 