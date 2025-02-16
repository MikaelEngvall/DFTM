import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setUserRole } = useAuth();

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/authenticate', {
        email,
        password
      });

      if (response.data && response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        
        if (user && user.role) {
          localStorage.setItem('userRole', user.role);
          setUserRole(user.role);
        }
        
        setIsAuthenticated(true);
        navigate('/calendar');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Ogiltiga inloggningsuppgifter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a2332]">
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg">
        <div className="flex justify-center">
          <img
            src="/images/Transparent Logo White Text.png"
            alt="DFTASKS"
            className="h-32"
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