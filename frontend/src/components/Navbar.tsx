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
}

export const Navbar = ({ onLogout }: NavbarProps) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string>();
  const [isUserManagementVisible, setIsUserManagementVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
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

  const languages = [
    { code: 'en', flag: GB, label: 'English' },
    { code: 'sv', flag: SE, label: 'Svenska' },
    { code: 'pl', flag: PL, label: 'Polski' },
    { code: 'uk', flag: UA, label: 'Українська' },
  ];

  return (
    <>
      <nav className="bg-[#1c2533] text-white">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex-shrink-0">
              <span className="text-xl font-bold">DFTASKS</span>
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
                className="p-1.5 rounded-md text-white hover:bg-white/10"
                title={t(isDarkMode ? 'navbar.theme.light' : 'navbar.theme.dark')}
              >
                {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>

              {/* Auth Section */}
              <div className="flex items-center space-x-2">
                {userFirstName ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="relative group">
                        <button
                          className="p-1.5 rounded-md text-white hover:bg-white/10"
                          title={t('navbar.auth.userTooltip')}
                        >
                          <FiUser className="w-5 h-5" />
                        </button>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {userFirstName}
                        </div>
                      </div>
                      {/* User Management Icon */}
                      <button
                        onClick={() => setIsUserManagementVisible(!isUserManagementVisible)}
                        className="p-1.5 rounded-md text-white hover:bg-white/10"
                        title={t('navbar.auth.manageUsers')}
                      >
                        <FiUsers className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-md text-white hover:bg-white/10"
                        title={t('navbar.auth.logout')}
                      >
                        <FiLogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="p-1.5 rounded-md text-white hover:bg-white/10"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
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