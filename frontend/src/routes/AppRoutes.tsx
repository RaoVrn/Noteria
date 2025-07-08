import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import RoomView from '../pages/RoomView';
import NotesPage from '../pages/NotesPage';
import ActivityPage from '../pages/ActivityPage';
import ProfileSettings from '../pages/ProfileSettings';
import AccountSettings from '../pages/AccountSettings';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/room/:roomId" 
        element={
          <ProtectedRoute>
            <RoomView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notes/:roomId" 
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/activity" 
        element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/account" 
        element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        } 
      />
      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
