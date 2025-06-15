import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import NotesRoom from './pages/NotesRoom'
import Login from './pages/Login'
import Signup from './pages/Signup'

function AppContent() {
  const { state } = useApp()

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors ${state.darkMode ? 'dark' : ''}`}>
      <Router>
        {state.user ? (
          <div className="flex h-screen">
            <Sidebar collapsed={state.sidebarCollapsed} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-auto bg-white dark:bg-gray-800">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/space/:spaceId" element={<NotesRoom />} />
                  <Route path="/space/:spaceId/subspace/:subspaceId" element={<NotesRoom />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
