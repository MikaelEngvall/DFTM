import { useState, useEffect } from 'react';
import {
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiCalendar,
  FiUsers,
  FiClock
} from 'react-icons/fi';
import { GB, SE, PL, UA } from 'country-flag-icons/react/3x2';
import { LoginModal } from './LoginModal';
import { useTranslation } from 'react-i18next';
import { userApi } from '../services/api/userApi';
import LogoDark from '../assets/Transparent Logo White Text.png';
import LogoLight from '../assets/Transparent Logo Black Text.png';

export const Navbar = ({
  userName,
  onLogout,
  onNavigate,
}: {
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userFirstName, setUserFirstName] = useState(userName);
  const [userRole, setUserRole] = useState<string>('');

  // Kontrollera tema och språk vid start
  useEffect(() => {
    // Kontrollera om dark mode är aktiverat i systemet eller om användaren har valt det tidigare
    const isDark = document.documentElement.classList.contains('dark') || 
                  window.matchMedia('(prefers-color-scheme: dark)').matches ||
                  localStorage.getItem('theme') === 'dark';
    
    setIsDarkMode(isDark);
    
    // Applicera tema
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Kontrollera om språket är sparat i localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  // Hämta användarinformation från JWT vid start
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await userApi.getLoggedInUser();
        if (user) {
          setUserFirstName(user.firstName);
          setUserRole(user.role);
        } else {
          // Användaren är inte inloggad eller token är ogiltig
          setUserFirstName(undefined);
          setUserRole('');
        }
      } catch (error) {
        console.error("Fel vid hämtning av användarinfo:", error);
        setUserFirstName(undefined);
        setUserRole('');
      }
    };
    
    fetchUserData();
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await userApi.login(email, password);
      // Hämta användarinfo efter inloggning
      const user = await userApi.getLoggedInUser();
      if (user) {
        setUserFirstName(user.firstName);
        setUserRole(user.role);
        
        // Ställ in språk baserat på användarens preferredLanguage
        if (user.preferredLanguage) {
          // Mappning från backend språkkod till frontend språkkod
          const languageMapping: Record<string, string> = {
            'SV': 'sv',
            'EN': 'en',
            'PL': 'pl',
            'UK': 'uk'
          };
          
          const frontendLangCode = languageMapping[user.preferredLanguage] || 'en';
          i18n.changeLanguage(frontendLangCode);
          // Spara även i localStorage så att språket bevaras
          localStorage.setItem('language', frontendLangCode);
        }
      }
      setIsLoginModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      // Här kan vi lägga till felhantering/meddelanden
    }
  };

  const handleLogout = () => {
    userApi.logout();
    setUserFirstName(undefined);
    setUserRole('');
    onLogout?.();
  };

  const handleNavigate = (view: string) => {
    // Anropa navigeringsfunktionen från props
    if (onNavigate) {
      onNavigate(view);
    } else {
      console.warn("Navigering fungerar inte: onNavigate-funktionen saknas");
    }
  };

  const navigateToProfile = () => {
    if (!userFirstName) {
      console.warn("Försöker navigera till profilen när användaren inte är inloggad");
      setIsLoginModalOpen(true);
      return;
    }
    handleNavigate('profile');
  };

  const navigateToCalendar = () => {
    if (!userFirstName) {
      console.warn("Försöker navigera till kalendern när användaren inte är inloggad");
      setIsLoginModalOpen(true);
      return;
    }
    handleNavigate('calendar');
  };

  const navigateToUserManagement = () => {
    if (!userFirstName) {
      console.warn("Försöker navigera till användarhanteringen när användaren inte är inloggad");
      setIsLoginModalOpen(true);
      return;
    }
    
    if (!canManageUsers) {
      console.warn("Användaren har inte behörighet att se användarhanteringen");
      handleNavigate('calendar');
      return;
    }
    
    handleNavigate('users');
  };

  const navigateToPendingTasks = () => {
    if (!userFirstName) {
      console.warn("Försöker navigera till väntande uppgifter när användaren inte är inloggad");
      setIsLoginModalOpen(true);
      return;
    }
    handleNavigate('pendingTasks');
  };

  // Språkalternativ
  const languages = [
    { code: 'sv', flag: SE, label: 'Svenska' },
    { code: 'en', flag: GB, label: 'English' },
    { code: 'pl', flag: PL, label: 'Polski' },
    { code: 'uk', flag: UA, label: 'Українська' },
  ];

  const canManageUsers = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN';
  const canManageTasks = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN' || userRole === 'ROLE_MANAGER';

  // Uppdatera för att hantera språkbyte och spara i localStorage
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <>
      <nav className="bg-background border-b border-border dark:bg-card dark:text-card-foreground">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div 
                className="cursor-pointer" 
                onClick={() => handleNavigate('landing')}
              >
                <img 
                  src={isDarkMode ? LogoDark : LogoLight} 
                  alt="DFTASKS" 
                  className="h-12" 
                />
              </div>
              
              {/* Language Selector - Moved next to logo */}
              <div className="flex space-x-1 ml-4">
                {languages.map(({ code, flag: Flag, label }) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`w-6 h-4 rounded-sm overflow-hidden transition-opacity ${
                      i18n.language === code ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                    }`}
                    title={label}
                  >
                    <Flag className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              
              {/* Calendar Icon - Moved next to language flags */}
              {userFirstName && (
                <button
                  onClick={navigateToCalendar}
                  className="p-1.5 ml-4 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10 flex items-center"
                  title={t('navbar.calendar')}
                >
                  <FiCalendar className="w-5 h-5" />
                </button>
              )}
              
              {/* User Management Icon - Moved next to calendar icon */}
              {userFirstName && canManageUsers && (
                <button
                  onClick={navigateToUserManagement}
                  className="p-1.5 ml-2 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10 flex items-center"
                  title={t('navbar.tooltips.manageUsers')}
                >
                  <FiUsers className="w-5 h-5" />
                </button>
              )}
              
              {/* Pending Tasks Icon */}
              {userFirstName && canManageTasks && (
                <button
                  onClick={navigateToPendingTasks}
                  className="p-1.5 ml-2 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10 flex items-center"
                  title={t('navbar.tooltips.pendingTasks')}
                >
                  <FiClock className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-6">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10"
                title={t(isDarkMode ? 'navbar.theme.light' : 'navbar.theme.dark')}
              >
                {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>

              {/* Auth Section - Always rightmost */}
              <div className="flex items-center space-x-2 ml-auto">
                {userFirstName ? (
                  <>
                    <div className="flex items-center space-x-2">
                      {/* Ta bort användarhanteringsikonen härifrån eftersom den flyttats till vänster sida */}
                      
                      <button
                        onClick={navigateToProfile}
                        className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10 flex items-center"
                        title={t('navbar.auth.userTooltip')}
                      >
                        <span className="text-sm font-medium">{userFirstName}</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10"
                        title={t('navbar.auth.logout')}
                      >
                        <FiLogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10"
                    title={t('navbar.auth.login')}
                  >
                    <FiUser className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
}; 