import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { LandingPage } from './components/LandingPage'
import { ProfilePage } from './components/ProfilePage'
import { Calendar } from './components/Calendar'
import { UserManagementPage } from './components/UserManagementPage'
import { PendingTasksManager } from './components/PendingTasksManager'
import { userApi } from './services/api/userApi'

function App() {
  // Vi behöver inte isLoggedIn eftersom vi kan använda userName för att avgöra inloggningsstatus
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [userRole, setUserRole] = useState<string>('');

  // Återställ sidans tillstånd vid laddning
  useEffect(() => {
    // Kolla om användaren är inloggad
    const token = localStorage.getItem('token');
    if (token) {
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
      console.log("Hämtar användardata...");
      const user = await userApi.getLoggedInUser();
      if (user) {
        console.log("Användare inloggad:", user.firstName, user.lastName, "med roll:", user.role);
        setUserId(user.id);
        setUserName(user.firstName);
        setUserRole(user.role);

        // Ställ in språk baserat på användarens preferredLanguage
        if (user.preferredLanguage) {
          console.log(`Setting language based on user preference: ${user.preferredLanguage}`);
          // Importera i18n direkt
          const i18n = (await import('./i18n')).default;
          
          // Mappning från backend språkkod till frontend språkkod
          const languageMapping: Record<string, string> = {
            'SV': 'sv',
            'EN': 'en',
            'PL': 'pl',
            'UK': 'uk'
          };
          
          const frontendLangCode = languageMapping[user.preferredLanguage] || 'en';
          i18n.changeLanguage(frontendLangCode);
          console.log(`Language changed to: ${frontendLangCode}`);
          // Spara även i localStorage så att språket bevaras
          localStorage.setItem('language', frontendLangCode);
        }

        // Om användaren loggar in, visa kalender för vanliga användare
        if (user.role === 'ROLE_USER' && currentView === 'landing') {
          setCurrentView('calendar');
        }
      } else {
        console.log("Ingen användarinformation hittad, användaren är inte inloggad");
        // Om användaren inte är inloggad eller token är ogiltig
        setUserName(undefined);
        setUserId('');
        setUserRole('');
        localStorage.removeItem('token');
        setCurrentView('landing');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Vid fel, rensa användardata
      setUserName(undefined);
      setUserId('');
      setUserRole('');
      localStorage.removeItem('token');
      setCurrentView('landing');
    }
  };

  // Spara aktuell vy när den ändras
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  const handleLogout = () => {
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

  // Funktion för att kontrollera om användaren har behörighet att hantera uppgifter
  const canManageTasks = () => {
    return userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN' || userRole === 'ROLE_MANAGER';
  };

  // Rendera rätt innehåll baserat på aktuell vy
  const renderContent = () => {
    console.log("Rendering view:", currentView, "with user role:", userRole);
    
    // Om vi inte har ett användarID för vyer som kräver inloggning, visa landningssidan
    if (!userId && (currentView === 'calendar' || currentView === 'profile' || currentView === 'users' || currentView === 'pendingTasks')) {
      console.log("Missing userId for protected view, redirecting to landing");
      // Sätt tillbaka tillståndet till landing utan delay
      setCurrentView('landing');
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Omdirigerar till startsidan...</p>
        </div>
      );
    }
    
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'profile':
        return <ProfilePage />;
      case 'calendar':
        return <Calendar userId={userId} userRole={userRole} />;
      case 'users':
        // Kontrollera om användaren har behörighet att se användarhantering
        if (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN') {
          return <UserManagementPage />;
        } else {
          console.log("Unauthorized access to users page, redirecting to calendar");
          // Sätt tillbaka tillståndet till calendar utan delay
          setCurrentView('calendar');
          return (
            <div className="container mx-auto px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Omdirigerar till kalendern...</p>
            </div>
          );
        }
      case 'pendingTasks':
        // Kontrollera om användaren har behörighet att hantera väntande uppgifter
        if (canManageTasks()) {
          return <PendingTasksManager />;
        } else {
          console.log("Unauthorized access to pending tasks page, redirecting to calendar");
          // Sätt tillbaka tillståndet till calendar utan delay
          setCurrentView('calendar');
          return (
            <div className="container mx-auto px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Omdirigerar till kalendern...</p>
            </div>
          );
        }
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">{currentView}</h2>
            <p>Innehållet för denna sida är inte tillgängligt.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
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