import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  onLogout: () => void;
  userRole: string;
  onThemeChange: () => void;
  isDarkMode: boolean;
}

export const Navbar = ({ onLogout, userRole, onThemeChange, isDarkMode }: NavbarProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'pl', flag: '🇵🇱', label: 'Polski' },
    { code: 'sv', flag: '🇸🇪', label: 'Svenska' },
    { code: 'ua', flag: '🇺🇦', label: 'Українська' },
  ];

  return (
    <nav className={`${
      isDarkMode 
        ? 'bg-[#1a2332] text-white border-gray-700' 
        : 'bg-white text-gray-800 border-gray-200'
    } p-4 border-b transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <img 
            src={isDarkMode ? "/images/Transparent Logo White Text.png" : "/images/Transparent Logo Black Text.png"}
            alt="DFTASKS" 
            className="h-16"
          />
          
          {/* Language flags */}
          <div className="flex space-x-2">
            {languages.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => i18n.changeLanguage(code)}
                className={`text-xl transition-opacity duration-200 ${
                  i18n.language === code 
                    ? 'opacity-100' 
                    : 'opacity-50 hover:opacity-75'
                } ${
                  isDarkMode 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}
                title={label}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation icons */}
        <div className="flex items-center space-x-6">
          {/* Calendar */}
          <button 
            className={`hover:text-blue-400 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
            onClick={() => navigate('/calendar')}
            title="Kalender"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          {/* Pending Tasks */}
          <button 
            className={`hover:text-blue-400 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
            onClick={() => navigate('/pending-tasks')}
            title="Granska felanmälningar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>

          {/* Users (only for admin/superadmin) */}
          {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') && (
            <button 
              className={`hover:text-blue-400 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
              onClick={() => navigate('/users')}
              title="Hantera användare"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          )}

          {/* Theme Toggle */}
          <button 
            className={`hover:text-blue-400 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
            onClick={onThemeChange}
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

          {/* Profile */}
          <button 
            className={`hover:text-blue-400 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
            onClick={() => navigate('/profile')}
            title="Min profil"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {/* Logout */}
          <button 
            onClick={onLogout}
            className={`hover:text-blue-400 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
            title="Logga ut"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}; 