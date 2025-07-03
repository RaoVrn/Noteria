import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Home, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition duration-200"
            >
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span>Noteria</span>
            </Link>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700 font-medium">{user.email}</span>
                  </div>
                </div>
                
                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-4 py-2 rounded-lg transition duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-lg transition duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Home Link */}
                <Link
                  to="/"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition duration-200"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                
                {/* Login Link */}
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg transition duration-200"
                >
                  Login
                </Link>
                
                {/* Sign Up Button */}
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
