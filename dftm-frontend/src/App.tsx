import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { LoginPage } from './components/LoginPage'
import { PendingTaskList } from './components/PendingTaskList'
import { Navbar } from './components/Navbar'
import axios from 'axios'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Calendar } from './components/Calendar'
import { Profile } from './components/Profile'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UserList } from './components/users/UserList'
import { Unauthorized } from './components/Unauthorized'

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

  return (
    <div className={`min-h-screen w-full ${isDarkMode ? 'bg-[#1a2332] text-white' : 'bg-gray-100 text-gray-900'}`}>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<LoginPage isDarkMode={isDarkMode} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          <Navbar 
            onLogout={handleLogout} 
            userRole={userRole} 
            onThemeChange={() => setIsDarkMode(!isDarkMode)}
            isDarkMode={isDarkMode}
          />
          <main className={`container mx-auto ${isDarkMode ? 'bg-[#1a2332]' : 'bg-white'}`}>
            <Routes>
              <Route path="/login" element={<LoginPage isDarkMode={isDarkMode} />} />
              
              <Route 
                path="/pending-tasks" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <PendingTaskList isDarkMode={isDarkMode} />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <Calendar isDarkMode={isDarkMode} />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/user-list" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <UserList isDarkMode={isDarkMode} />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile isDarkMode={isDarkMode} />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/unauthorized" element={<Unauthorized />} />
              
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
