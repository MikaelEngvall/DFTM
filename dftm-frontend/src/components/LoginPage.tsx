import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface LoginPageProps {
  isDarkMode: boolean;
  onThemeChange?: () => void;
}

export const LoginPage = ({ isDarkMode, onThemeChange }: LoginPageProps) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setUserRole } = useAuth();

  const languages = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'pl', flag: '🇵🇱', label: 'Polski' },
    { code: 'sv', flag: '🇸🇪', label: 'Svenska' },
    { code: 'ua', flag: '🇺🇦', label: 'Українська' },
  ];

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
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#1a2332]' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg ${isDarkMode ? '' : 'bg-white shadow-lg'}`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2">
            {languages.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => i18n.changeLanguage(code)}
                className={`text-xl ${i18n.language === code ? 'opacity-100' : 'opacity-50'}`}
                title={label}
              >
                {flag}
              </button>
            ))}
          </div>
          {onThemeChange && (
            <button 
              onClick={onThemeChange}
              className={`p-2 rounded-full ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
              title={isDarkMode ? 'Ljust tema' : 'Mörkt tema'}
            >
              {isDarkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="flex justify-center">
          <img
            src={isDarkMode ? "/images/Transparent Logo White Text.png" : "/images/Transparent Logo Black Text.png"}
            alt="DFTASKS"
            className="h-32"
          />
        </div>
        
        <div className={`text-center uppercase tracking-wider text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                className={`mt-1 block w-full rounded border p-2 
                  ${isDarkMode 
                    ? 'border-gray-600 bg-[#1a2332] text-gray-300' 
                    : 'border-gray-300 bg-white text-gray-900'} 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed`}
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
                className={`mt-1 block w-full rounded border p-2 
                  ${isDarkMode 
                    ? 'border-gray-600 bg-[#1a2332] text-gray-300' 
                    : 'border-gray-300 bg-white text-gray-900'} 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed`}
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