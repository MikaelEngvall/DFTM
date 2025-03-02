import { useState, useEffect } from 'react';
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiCalendar,
} from 'react-icons/fi';
import { GB, SE, PL, UA } from 'country-flag-icons/react/3x2';
import { LoginModal } from './LoginModal';
import { UserManagementTable } from './UserManagementTable';
import { useTranslation } from 'react-i18next';
import { User } from '../types/user';
import { userApi } from '../services/api/userApi';

export const Navbar = ({
  isLoggedIn,
  userName,
  onLogout,
  onNavigate,
}: {
  isLoggedIn: boolean;
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userFirstName, setUserFirstName] = useState(userName);
  const [isUserManagementVisible, setIsUserManagementVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    const fetchCurrentUser = async () => {
      const user = await userApi.getCurrentUser();
      if (user) {
        setUserFirstName(user.firstName);
        setUserRole(user.role);
        console.log("Navbar received user role:", user.role);
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
        setUserRole(user.role);
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
      // Validera token innan vi försöker skapa användaren
      const tokenStatus = userApi.validateToken();
      console.log('Token status innan försök att skapa användare:', tokenStatus);
      
      if (!tokenStatus.valid) {
        console.error(`Kan inte skapa användare - ogiltigt token: ${tokenStatus.reason}`);
        // Här kan man implementera ett visuellt felmeddelande till användaren
        return;
      }
      
      if (tokenStatus.role !== 'ROLE_SUPERADMIN') {
        console.error(`Kan inte skapa användare - fel roll: ${tokenStatus.role}, endast ROLE_SUPERADMIN kan skapa användare`);
        // Här kan man implementera ett visuellt felmeddelande till användaren
        return;
      }
      
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
    setUserRole('');
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

  const navigateToCalendar = () => {
    handleNavigate('calendar');
  };

  // Språkalternativ
  const languages = [
    { code: 'sv', flag: SE, label: 'Svenska' },
    { code: 'en', flag: GB, label: 'English' },
    { code: 'uk', flag: UA, label: 'Українська' },
  ];

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

              {/* Auth Section */}
              <div className="flex items-center space-x-2">
                {userFirstName ? (
                  <>
                    <div className="flex items-center space-x-2">
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

      {isUserManagementVisible && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">Användarhantering</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
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