import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Moon, Sun, User, LogOut, Bell, Search, Plus } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { signOut } from '../supabaseClient'

function Navbar() {
  const { state, dispatch } = useApp()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      dispatch({ type: 'SET_USER', payload: null })
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' })
  }

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  // Don't render anything if still loading
  if (state.loading) {
    return null
  }

  // If user is not logged in, show public navbar
  if (!state.user) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
          Noteria
        </Link>
        <div className="space-x-4 text-sm font-medium">
          <Link to="/" className="hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400">
            Home
          </Link>
          <Link to="/login" className="hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400">
            Login
          </Link>
          <Link to="/signup" className="hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400">
            Sign Up
          </Link>
        </div>
      </nav>
    )
  }

  // User is logged in, show authenticated navbar
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <Link to="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
          Noteria
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {state.darkMode ? (
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {state.user?.email?.split('@')[0] || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
