import { useState } from 'react';
import axios from 'axios';
import { AuthResponse } from '../types';

interface LoginProps {
  onLogin: (token: string) => void;
}

export const LoginPage = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post<AuthResponse>(
        'http://localhost:8080/api/v1/auth/authenticate', 
        { email, password },
        { 
          headers: { 'Content-Type': 'application/json' },
          validateStatus: (status) => status === 200 
        }
      );
      
      const token = response.data.token;
      onLogin(token);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data);
        if (error.response?.status === 403) {
          setError('Invalid credentials');
        } else if (error.response?.status === 0) {
          setError('Cannot connect to server');
        } else {
          setError(`Login failed: ${error.response?.data?.message || 'Unknown error'}`);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to DFTM
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}; 