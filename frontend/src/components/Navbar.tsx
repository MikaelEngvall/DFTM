import { useState, useEffect } from 'react';
import {
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiCalendar,
  FiUsers
} from 'react-icons/fi';
import { GB, SE, PL, UA } from 'country-flag-icons/react/3x2';
import { LoginModal } from './LoginModal';
import { useTranslation } from 'react-i18next';
import { userApi } from '../services/api/userApi';

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

  // Kontrollera tema vid start
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
  }, []);

  // Hämta användarinformation från JWT vid start
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await userApi.getLoggedInUser();
        if (user) {
          setUserFirstName(user.firstName);
          setUserRole(user.role);
          console.log("Navbar received user role:", user.role);
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
      }
      setIsLoginModalOpen(false);
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
    console.log(`Navigating to: ${view}`);
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

  // Språkalternativ
  const languages = [
    { code: 'sv', flag: SE, label: 'Svenska' },
    { code: 'en', flag: GB, label: 'English' },
    { code: 'pl', flag: PL, label: 'Polski' },
    { code: 'uk', flag: UA, label: 'Українська' },
  ];

  const canManageUsers = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN';

  return (
    <>
      <nav className="bg-background border-b border-border dark:bg-card dark:text-card-foreground">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <span 
                className="text-xl font-bold cursor-pointer" 
                onClick={() => handleNavigate('landing')}
              >
                DFTASKS
              </span>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-6">
              {/* Calendar Link for Logged-in Users */}
              {userFirstName && (
                <button
                  onClick={navigateToCalendar}
                  className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10 flex items-center"
                  title={t('navbar.calendar')}
                >
                  <FiCalendar className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Kalender</span>
                </button>
              )}

              {/* Language Selector */}
              <div className="flex space-x-1">
                {languages.map(({ code, flag: Flag, label }) => (
                  <button
                    key={code}
                    onClick={() => i18n.changeLanguage(code)}
                    className={`w-6 h-4 rounded-sm overflow-hidden transition-opacity ${
                      i18n.language === code ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                    }`}
                    title={label}
                  >
                    <Flag className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

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
                      {/* Användarhanteringsikon för admin/superadmin */}
                      {canManageUsers && (
                        <button
                          onClick={navigateToUserManagement}
                          className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10 flex items-center"
                          title={t('navbar.tooltips.manageUsers')}
                        >
                          <FiUsers className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={navigateToProfile}
                        className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-foreground/10 flex items-center"
                        title={t('navbar.auth.userTooltip')}
                      >
                        <FiUser className="w-5 h-5 mr-1" />
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