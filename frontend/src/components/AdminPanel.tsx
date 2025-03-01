import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { taskApi } from '../services/api/taskApi';
import { userApi } from '../services/api/userApi';
import { User } from '../types/user';
import axios, { AxiosError } from 'axios';

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
    
    // Visa vem som försöker skapa uppgifterna för debugging
    try {
      const currentUser = await userApi.getCurrentUser();
      console.log('Nuvarande användare:', currentUser);
      console.log('Användarroll:', currentUser.role);
      console.log('Försöker skapa uppgifter som:', selectedAssigner, 'till:', selectedAssigned);
      
      await taskApi.createExampleTasks(selectedAssigner, selectedAssigned);
      setSuccessMessage('Exempeluppgifter har skapats framgångsrikt!');
    } catch (error) {
      console.error('Fel vid skapande av exempeluppgifter:', error);
      
      // Mer detaljerad felhantering
      let errorMsg = 'Ett fel uppstod vid skapande av exempeluppgifter.';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        // Server svarade med en statuskod utanför 2xx intervallet
        if (axiosError.response) {
          console.error('Server svarade med felkod:', axiosError.response.status);
          console.error('Felmeddelande från server:', axiosError.response.data);
          
          if (axiosError.response.status === 403) {
            errorMsg = 'Åtkomst nekad. Du saknar behörighet att skapa uppgifter.';
          } else if (axiosError.response.status === 401) {
            errorMsg = 'Du är inte autentiserad. Vänligen logga in igen.';
          } else {
            // Säker hantering av response.data
            const responseData = axiosError.response.data as Record<string, unknown>;
            const errorMessage = responseData && typeof responseData === 'object' && 'message' in responseData 
              ? String(responseData.message)
              : 'Okänt fel';
            errorMsg = `Serverfel (${axiosError.response.status}): ${errorMessage}`;
          }
        } else if (axiosError.request) {
          // Begäran gjordes men inget svar mottogs
          errorMsg = 'Ingen respons från servern. Kontrollera din internetanslutning.';
        }
      }
      
      setErrorMessage(errorMsg);
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