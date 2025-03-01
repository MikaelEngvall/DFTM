import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { LandingPage } from './components/LandingPage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>();
  const [currentView, setCurrentView] = useState<string>('landing');

  // Återställ sidans tillstånd vid laddning
  useEffect(() => {
    // Kolla om användaren är inloggad
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }

    // Återställ vyn från local storage om den finns
    const savedView = localStorage.getItem('currentView');
    if (savedView) {
      setCurrentView(savedView);
    }
  }, []);

  // Spara aktuell vy när den ändras
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName(undefined);
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
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">{currentView}</h2>
            <p>Innehåll kommer att visas här.</p>
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