import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { LoginPage } from './components/LoginPage'
import { PendingTaskList } from './components/PendingTaskList'
import { Navbar } from './components/Navbar'
import axios from 'axios'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Calendar } from './components/Calendar'
import { UserManagement } from './components/UserManagement'
import { Profile } from './components/Profile'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const { isAuthenticated, setIsAuthenticated, userRole, setUserRole } = useAuth()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUserRole = localStorage.getItem('userRole')
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsAuthenticated(true)
      if (savedUserRole) {
        setUserRole(savedUserRole)
      }
    }
  }, [setIsAuthenticated, setUserRole])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    delete axios.defaults.headers.common['Authorization']
    setIsAuthenticated(false)
    setUserRole('')
  }

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-[#1a2332] w-full">
      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <>
          <Navbar 
            onLogout={handleLogout} 
            userRole={userRole} 
            onThemeChange={() => setIsDarkMode(!isDarkMode)}
            isDarkMode={isDarkMode}
          />
          <main className="container mx-auto">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route 
                path="/pending-tasks" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <PendingTaskList />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/calendar" 
                element={
                  <PrivateRoute>
                    <Calendar />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/" element={<Navigate to="/calendar" replace />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
