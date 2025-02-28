import { useState } from 'react';
import { FiSun, FiMoon, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { GB, SE, PL, UA } from 'country-flag-icons/react/3x2';
import { LoginModal } from './LoginModal';

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Navbar = ({ isLoggedIn, userName, onLogout }: NavbarProps) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string>();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = (email: string, password: string) => {
    // Här implementerar vi login-logiken senare
    console.log('Login attempt:', { email, password });
    // Simulerar en lyckad inloggning
    setUserFirstName('John'); // Detta ska komma från API:et senare
    setIsLoginModalOpen(false);
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
                    onClick={() => setCurrentLanguage(code)}
                    className={`w-6 h-4 rounded-sm overflow-hidden transition-opacity ${
                      currentLanguage === code ? 'opacity-100' : 'opacity-50 hover:opacity-75'
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
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
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
                          title={userFirstName}
                        >
                          <FiUser className="w-5 h-5" />
                        </button>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {userFirstName}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUserFirstName(undefined);
                          onLogout?.();
                        }}
                        className="p-1.5 rounded-md text-white hover:bg-white/10"
                        title="Logga ut"
                      >
                        <FiLogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="p-1.5 rounded-md text-white hover:bg-white/10"
                    title="Logga in"
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
    </>
  );
}; 