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
    // Skapa en funktion som kan avbrytas
    let isMounted = true;
    const abortController = new AbortController();
    
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Hämtar användarlista...');
        const fetchedUsers = await userApi.getUsers();
        
        // Kontrollera om komponenten fortfarande är monterad innan uppdatering av state
        if (isMounted) {
          console.log('Antal hämtade användare:', fetchedUsers.length);
          setUsers(fetchedUsers);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        // Kontrollera om komponenten fortfarande är monterad innan uppdatering av state
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av användare');
          setIsLoading(false);
        }
      }
    };

    fetchUsers();
    
    // Cleanup-funktion som körs när komponenten avmonteras
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      console.log('Uppdaterar användare:', updatedUser);
      const updated = await userApi.updateUser(updatedUser);
      console.log('Uppdaterad användare från server:', updated);
      
      // Uppdatera användarlistan med korrekt data inklusive isActive
      setUsers(prevUsers => {
        const newUsers = prevUsers.map(user => (user.id === updated.id ? {
          ...updated,
          // Säkerställ att isActive finns med
          isActive: updated.isActive ?? user.isActive
        } : user));
        console.log('Uppdaterade användarlistan:', newUsers);
        return newUsers;
      });
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
      <h2 className="text-2xl font-bold mb-4">{t('userManagement.title')}</h2>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p className="font-medium">{t('common.error')}</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {t('common.retry')}
          </button>
        </div>
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