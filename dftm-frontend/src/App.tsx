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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (token: string) => {
    setIsAuthenticated(true)
    // Här kan vi också sätta userRole baserat på JWT-token
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#1a2332] w-full">
        <Navbar 
          onLogout={handleLogout} 
          userRole={userRole} 
          onThemeChange={() => setIsDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />
        <main className="container mx-auto">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            
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
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
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
            
            <Route path="/" element={<Navigate to="/pending-tasks" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
