import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { LandingPage } from './components/LandingPage'
import { ProfilePage } from './components/ProfilePage'
import { Calendar } from './components/Calendar'
import { AdminPanel } from './components/AdminPanel'
import { userApi } from './services/api/userApi'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [userRole, setUserRole] = useState<string>('');

  // Återställ sidans tillstånd vid laddning
  useEffect(() => {
    // Kolla om användaren är inloggad
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserData();
    }

    // Återställ vyn från local storage om den finns
    const savedView = localStorage.getItem('currentView');
    if (savedView) {
      setCurrentView(savedView);
    }
  }, []);

  // Hämta användarinformation
  const fetchUserData = async () => {
    try {
      const user = await userApi.getCurrentUser();
      if (user) {
        setUserId(user.id);
        setUserName(user.firstName);
        setUserRole(user.role);
        
        // Om användaren loggar in, visa kalender för vanliga användare
        if ((user.role === 'user' || user.role === 'ROLE_USER') && currentView === 'landing') {
          setCurrentView('calendar');
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Spara aktuell vy när den ändras
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName(undefined);
    setUserId('');
    setUserRole('');
    localStorage.removeItem('token');
    setCurrentView('landing');
  };

  // Funktion för att ändra vy
  const navigateTo = (view: string) => {
    setCurrentView(view);
  };

  // Rendera rätt innehåll baserat på aktuell vy
  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'profile':
        return <ProfilePage />;
      case 'calendar':
        return userId ? <Calendar userId={userId} /> : <div>Laddar...</div>;
      case 'admin':
        return (userRole === 'admin' || userRole === 'superadmin' || 
                userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN') 
                ? <AdminPanel /> 
                : <div>Åtkomst nekad</div>;
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">{currentView}</h2>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
        onNavigate={navigateTo}
      />
      <main>
        {renderContent()}
      </main>
    </div>
  )
}

export default App 