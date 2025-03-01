import { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiLogIn, FiLogOut, FiUser, FiUsers } from 'react-icons/fi';
import { GB, SE, PL, UA } from 'country-flag-icons/react/3x2';
import { LoginModal } from './LoginModal';
import { UserManagementTable } from './UserManagementTable';
import { useTranslation } from 'react-i18next';
import { User } from '../types/user';
import { userApi } from '../services/api/userApi';

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

export const Navbar = ({ onLogout, onNavigate }: NavbarProps) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string>();
  const [isUserManagementVisible, setIsUserManagementVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const fetchCurrentUser = async () => {
      const user = await userApi.getCurrentUser();
      if (user) {
        setUserFirstName(user.firstName);
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (isUserManagementVisible) {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedUsers = await userApi.getUsers();
          setUsers(fetchedUsers);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av användare');
          console.error('Error fetching users:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();
  }, [isUserManagementVisible]);

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
      const user = await userApi.getCurrentUser();
      if (user) {
        setUserFirstName(user.firstName);
      }
      setIsLoginModalOpen(false);
    } catch (err) {
      console.error('Login error:', err);
      // Här kan vi lägga till felhantering/meddelanden
    }
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      const updated = await userApi.updateUser(updatedUser);
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === updated.id ? updated : user))
      );
    } catch (err) {
      console.error('Error updating user:', err);
      // Här kan vi lägga till felhantering/meddelanden
    }
  };

  const handleUserCreate = async (newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await userApi.createUser(newUser);
      setUsers(prevUsers => [...prevUsers, created]);
    } catch (err) {
      console.error('Error creating user:', err);
      // Här kan vi lägga till felhantering/meddelanden
    }
  };

  const handleLogout = () => {
    userApi.logout();
    setUserFirstName(undefined);
    onLogout?.();
  };

  const handleNavigate = (view: string) => {
    // Dölj användarhantering om vi navigerar bort
    if (view !== 'users') {
      setIsUserManagementVisible(false);
    }
    
    // Anropa navigeringsfunktionen från props
    onNavigate?.(view);
  };

  const navigateToProfile = () => {
    handleNavigate('profile');
  };

  const languages = [
    { code: 'en', flag: GB, label: 'English' },
    { code: 'sv', flag: SE, label: 'Svenska' },
    { code: 'pl', flag: PL, label: 'Polski' },
    { code: 'uk', flag: UA, label: 'Українська' },
  ];

  return (
    <>
      <nav className="bg-background border-b border-border dark:bg-[#1c2533] dark:text-white">
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
                className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-white/10"
                title={t(isDarkMode ? 'navbar.theme.light' : 'navbar.theme.dark')}
              >
                {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>

              {/* Auth Section */}
              <div className="flex items-center space-x-2">
                {userFirstName ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={navigateToProfile}
                        className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-white/10 flex items-center"
                        title={t('navbar.auth.userTooltip')}
                      >
                        <FiUser className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">{userFirstName}</span>
                      </button>
                      {/* User Management Icon */}
                      <button
                        onClick={() => {
                          setIsUserManagementVisible(!isUserManagementVisible);
                          handleNavigate('users');
                        }}
                        className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-white/10"
                        title={t('navbar.auth.manageUsers')}
                      >
                        <FiUsers className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-white/10"
                        title={t('navbar.auth.logout')}
                      >
                        <FiLogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="p-1.5 rounded-md hover:bg-foreground/10 dark:hover:bg-white/10"
                    title={t('navbar.auth.login')}
                  >
                    <FiLogIn className="w-5 h-5" />
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

      {isUserManagementVisible && (
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground dark:border-white"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <UserManagementTable 
              users={users} 
              onUserUpdate={handleUserUpdate}
              onUserCreate={handleUserCreate}
            />
          )}
        </div>
      )}
    </>
  );
}; 