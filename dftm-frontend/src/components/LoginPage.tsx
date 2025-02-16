import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { AuthResponse } from '../types';

interface LoginProps {
  onLogin: (token: string) => void;
}

export const LoginPage = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setShowError(false);

    try {
      const response = await axios.post<AuthResponse>(
        'http://localhost:8080/api/v1/auth/authenticate',
        { email, password }
      );
      
      const { token, user } = response.data;
      onLogin(token);
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 403:
            setError('Ogiltiga inloggningsuppgifter');
            break;
          case 429:
            setError('För många försök. Vänta en stund och försök igen.');
            break;
          case 500:
            setError('Serverfel. Kontakta systemadministratören.');
            break;
          default:
            setError(`Inloggningen misslyckades: ${error.response?.data?.message || 'Okänt fel'}`);
        }
      } else {
        setError('Ett oväntat fel inträffade. Kontrollera din internetanslutning.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a2332]">
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg">
        <div className="flex justify-center">
          <img
            src="duggals-light.png"
            alt="Duggals Fastigheter"
            className="h-24"
          />
        </div>
        
        <div className="text-center text-gray-300 uppercase tracking-wider text-sm font-medium">
          Fastighetsförvaltning
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && showError && (
            <div 
              className="bg-[#3d2936] text-[#ff6b6b] p-3 rounded text-center text-sm
                         transform transition-all duration-300 ease-in-out
                         animate-[slideIn_0.3s_ease-out]"
            >
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                E-post
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-600 bg-[#1a2332] shadow-sm p-2 
                         text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                Lösenord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-600 bg-[#1a2332] shadow-sm p-2 
                         text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                     shadow-sm text-sm font-medium text-white bg-[#2c3b52] hover:bg-[#374760] 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                     uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed
                     relative"
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Loggar in</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              </>
            ) : (
              'Logga in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}; 