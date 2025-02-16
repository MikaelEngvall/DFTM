import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { LoginPage } from './components/LoginPage'
import { PendingTaskList } from './components/PendingTaskList'
import axios from 'axios'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (token: string) => {
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            DFTM Task Manager
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              delete axios.defaults.headers.common['Authorization']
              setIsAuthenticated(false)
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PendingTaskList />
      </main>
    </div>
  )
}

export default App
