import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { taskApi } from '../services/api/taskApi';
import { userApi } from '../services/api/userApi';
import { User } from '../types/user';

export const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAssigner, setSelectedAssigner] = useState<string>('');
  const [selectedAssigned, setSelectedAssigned] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userApi.getUsers();
        setUsers(fetchedUsers);
        
        // Försök hitta Mikael Engvall automatiskt
        const mikaelUser = fetchedUsers.find(user => 
          user.firstName.toLowerCase() === 'mikael' && 
          user.lastName.toLowerCase() === 'engvall'
        );
        
        if (mikaelUser) {
          setSelectedAssigner(mikaelUser.id);
        }
        
        // Försök hitta en vanlig användare
        const regularUser = fetchedUsers.find(user => 
          user.role === 'user' || user.role === 'ROLE_USER'
        );
        
        if (regularUser) {
          setSelectedAssigned(regularUser.id);
        }
      } catch (error) {
        console.error('Fel vid hämtning av användare:', error);
        setErrorMessage('Kunde inte hämta användare. Vänligen försök igen.');
      }
    };
    
    fetchUsers();
  }, []);

  const handleCreateExampleTasks = async () => {
    if (!selectedAssigner || !selectedAssigned) {
      setErrorMessage('Du måste välja både tilldelaren och tilldelad användare.');
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await taskApi.createExampleTasks(selectedAssigner, selectedAssigned);
      setSuccessMessage('Exempeluppgifter har skapats framgångsrikt!');
    } catch (error) {
      console.error('Fel vid skapande av exempeluppgifter:', error);
      setErrorMessage('Ett fel uppstod vid skapande av exempeluppgifter. Vänligen försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Administratörspanel</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Skapa exempeluppgifter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tilldelare (Mikael Engvall)
            </label>
            <select
              className="w-full p-2 border border-border rounded-md"
              value={selectedAssigner}
              onChange={(e) => setSelectedAssigner(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Välj tilldelare</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Tilldelad användare (Regular User)
            </label>
            <select
              className="w-full p-2 border border-border rounded-md"
              value={selectedAssigned}
              onChange={(e) => setSelectedAssigned(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Välj tilldelad användare</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <Button
          onClick={handleCreateExampleTasks}
          disabled={isLoading || !selectedAssigner || !selectedAssigned}
          className="w-full"
        >
          {isLoading ? 'Skapar uppgifter...' : 'Skapa exempeluppgifter'}
        </Button>
        
        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}; 