import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { languages } from '../i18n/languages';
import { Link } from 'react-router-dom';
import { UserGroupIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface NavbarProps {
  onLogout: () => void;
  userRole: string;
  onThemeChange: () => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
}

export const Navbar = ({ onLogout, userRole, onThemeChange, isDarkMode, onDarkModeToggle }: NavbarProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:8080/api/v1/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const preferredLanguage = response.data.preferredLanguage?.toLowerCase();
        if (preferredLanguage) {
          // Konvertera språkkod till rätt format (t.ex. 'SV' -> 'se')
          const languageMap: { [key: string]: string } = {
            'SV': 'se',
            'EN': 'gb',
            'PL': 'pl',
            'UK': 'ua'
          };
          const mappedLanguage = languageMap[preferredLanguage.toUpperCase()];
          if (mappedLanguage) {
            i18n.changeLanguage(mappedLanguage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, [i18n]);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('preferredLanguage', code);
  };

  const navItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: t('nav.calendar'),
      onClick: () => navigate('/calendar')
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: t('nav.pendingTasks'),
      onClick: () => navigate('/pending-tasks')
    },
    ...(userRole === 'ADMIN' || userRole === 'SUPERADMIN' ? [{
      icon: <UserGroupIcon className="h-6 w-6" />,
      label: t('nav.manageUsers'),
      onClick: () => navigate('/user-management')
    }] : []),
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: t('nav.profile'),
      onClick: () => navigate('/profile')
    }
  ];

  return (
    <nav className={`${
      isDarkMode 
        ? 'bg-[#1a2332] text-white border-gray-700' 
        : 'bg-white text-gray-800 border-gray-200'
    } p-4 border-b transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <img 
              src={isDarkMode ? "/images/Transparent Logo White Text.png" : "/images/Transparent Logo Black Text.png"}
              alt="DFTASKS" 
              className="h-16"
            />
            
            <div className="flex space-x-2">
              {languages.map(({ code, flag, label }) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`text-xl transition-opacity duration-200 relative group ${
                    i18n.language === code 
                      ? 'opacity-100 after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-blue-500' 
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <span>{flag}</span>
                  {/* Tooltip */}
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-gray-900 text-white text-xs px-2 py-1 rounded 
                                 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="hover:text-blue-400 transition-colors duration-200"
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
            
            <button 
              onClick={onThemeChange} 
              className="hover:text-blue-400 transition-colors duration-200"
              title={isDarkMode ? t('nav.lightTheme') : t('nav.darkTheme')}
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

            <button 
              onClick={onLogout} 
              className="hover:text-blue-400 transition-colors duration-200"
              title={t('nav.logout')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <img 
            src={isDarkMode ? "/images/Transparent Logo White Text.png" : "/images/Transparent Logo Black Text.png"}
            alt="DFTASKS" 
            className="h-12"
          />
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden mt-4 py-4 ${isDarkMode ? 'bg-[#1f2937]' : 'bg-gray-50'} rounded-lg`}>
            <div className="px-4 py-2 mb-4 flex justify-center space-x-4">
              {languages.map(({ code, flag, label }) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`text-xl transition-opacity duration-200 ${
                    i18n.language === code ? 'opacity-100' : 'opacity-50'
                  }`}
                  title={label}
                >
                  {flag}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 flex items-center space-x-3 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="px-4 pt-2 border-t border-gray-700">
                <button
                  onClick={onThemeChange}
                  className="w-full py-2 flex items-center space-x-3"
                >
                  {isDarkMode ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{t('nav.lightTheme')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>{t('nav.darkTheme')}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-2 flex items-center space-x-3 text-red-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}; 