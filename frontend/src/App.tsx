import { useState } from 'react'
import { Navbar } from './components/Navbar'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {/* Content will go here */}
      </main>
    </div>
  )
}

export default App 