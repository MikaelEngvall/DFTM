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

  // Funktion för att kontrollera om en vy kräver inloggning
  const requiresAuthentication = (view: string): boolean => {
    return ['calendar', 'profile', 'users', 'pendingTasks'].includes(view);
  };

  // Funktion för att uppdatera URL-hashen baserat på aktuell vy
  const updateUrlHash = (view: string) => {
    window.location.hash = view;
  };

  // Funktion för att hämta vy från URL-hash
  const getViewFromHash = (): string => {
    const hash = window.location.hash.substring(1); // Ta bort #-tecknet
    return hash || 'landing'; // Standardvärde om hash är tom
  };

  // Återställ sidans tillstånd vid laddning baserat på URL-hash
  useEffect(() => {
    const handleHashChange = () => {
      const viewFromHash = getViewFromHash();
      console.log("URL hash changed, new view:", viewFromHash);
      
      // Om vyn kräver autentisering och användaren inte är inloggad, stannar vi på landing
      if (requiresAuthentication(viewFromHash) && !localStorage.getItem('token')) {
        console.log("View requires authentication but no token found");
        if (window.location.hash !== '#landing') {
          window.location.hash = 'landing';
        }
        return;
      }
      
      setCurrentView(viewFromHash);
    };

    // Lyssna på hash-ändringar i URL:en
    window.addEventListener('hashchange', handleHashChange);
    
    // Initialisera vid första laddningen
    const initialView = getViewFromHash();
    console.log("Initial hash view:", initialView);
    
    const token = localStorage.getItem('token');
    if (token) {
      // Om användaren är inloggad, hämta användardata och sätt korrekt vy
      fetchUserData().then(() => {
        if (requiresAuthentication(initialView)) {
          setCurrentView(initialView);
        }
      });
    } else if (!requiresAuthentication(initialView)) {
      // Om vyn inte kräver autentisering, sätt den direkt
      setCurrentView(initialView);
    } else {
      // Om vyn kräver autentisering men användaren inte är inloggad
      window.location.hash = 'landing';
    }

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
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

        // Om användaren loggar in och är på landningssidan, visa kalender för vanliga användare
        const currentHash = getViewFromHash();
        if (user.role === 'ROLE_USER' && (currentHash === 'landing' || currentHash === '')) {
          window.location.hash = 'calendar';
        }
        
        return true; // Indikerar framgångsrik autentisering
      } else {
        console.log("Ingen användarinformation hittad, användaren är inte inloggad");
        // Om användaren inte är inloggad eller token är ogiltig
        setUserName(undefined);
        setUserId('');
        setUserRole('');
        localStorage.removeItem('token');
        
        // Kontrollera om nuvarande vy kräver autentisering
        if (requiresAuthentication(getViewFromHash())) {
          window.location.hash = 'landing';
        }
        
        return false;
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Vid fel, rensa användardata
      setUserName(undefined);
      setUserId('');
      setUserRole('');
      localStorage.removeItem('token');
      
      // Kontrollera om nuvarande vy kräver autentisering
      if (requiresAuthentication(getViewFromHash())) {
        window.location.hash = 'landing';
      }
      
      return false;
    }
  };

  // Uppdatera URL-hash när aktuell vy ändras
  useEffect(() => {
    updateUrlHash(currentView);
  }, [currentView]);

  const handleLogout = () => {
    setUserName(undefined);
    setUserId('');
    setUserRole('');
    localStorage.removeItem('token');
    window.location.hash = 'landing';
  };

  // Funktion för att ändra vy
  const navigateTo = (view: string) => {
    window.location.hash = view;
  };

  // Funktion för att kontrollera om användaren har behörighet att hantera uppgifter
  const canManageTasks = () => {
    return userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN' || userRole === 'ROLE_MANAGER';
  };

  // Rendera rätt innehåll baserat på aktuell vy
  const renderContent = () => {
    console.log("Rendering view:", currentView, "with user role:", userRole);
    
    // Om vi inte har ett användarID för vyer som kräver inloggning, visa landningssidan
    if (!userId && requiresAuthentication(currentView)) {
      console.log("Missing userId for protected view, redirecting to landing");
      // Sätt tillbaka tillståndet till landing utan delay
      window.location.hash = 'landing';
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
          window.location.hash = 'calendar';
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
          window.location.hash = 'calendar';
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