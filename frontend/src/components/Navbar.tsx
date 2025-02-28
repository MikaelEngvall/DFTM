import { useState } from 'react';
import { FiSun, FiMoon, FiLogIn, FiLogOut } from 'react-icons/fi';
import { GB, SE, PL, UA } from 'country-flag-icons/react/3x2';

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Navbar = ({ isLoggedIn, userName, onLogout }: NavbarProps) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const languages = [
    { code: 'en', flag: GB, label: 'English' },
    { code: 'sv', flag: SE, label: 'Svenska' },
    { code: 'pl', flag: PL, label: 'Polski' },
    { code: 'uk', flag: UA, label: 'Українська' },
  ];

  return (
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
              {isLoggedIn ? (
                <>
                  <span className="text-white/90">{userName}</span>
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-md text-white hover:bg-white/10"
                    title="Logout"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  className="p-1.5 rounded-md text-white hover:bg-white/10"
                  title="Login"
                >
                  <FiLogIn className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}; 