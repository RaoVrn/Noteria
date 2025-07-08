import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { roomAPI, noteAPI } from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  Camera,
  Edit3,
  Database,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserStats {
  totalRooms: number;
  totalNotes: number;
}

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ totalRooms: 0, totalNotes: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    displayName: user?.email.split('@')[0] || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.email.split('@')[0],
        email: user.email
      }));
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoadingStats(true);
      const rooms = await roomAPI.getAll();
      
      // Count total notes across all rooms
      let totalNotes = 0;
      for (const room of rooms) {
        try {
          const notes = await noteAPI.getByRoom(room._id);
          totalNotes += notes.length;
        } catch (error) {
          // Skip if room has no notes or error occurred
        }
      }
      
      setUserStats({
        totalRooms: rooms.length,
        totalNotes
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveProfile = () => {
    // TODO: Implement API call to update profile when backend supports it
    toast.success('Profile display name updated locally!');
    setIsEditing(false);
  };

  const handleSavePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    // TODO: Implement API call to update password when backend supports it
    toast.error('Password change not yet implemented in backend');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          
          {/* Settings Navigation */}
          <div className="flex space-x-1 mt-4 bg-white/50 backdrop-blur-sm rounded-lg p-1 w-fit">
            <div className="bg-white shadow-sm px-4 py-2 rounded-md text-sm font-medium text-indigo-600 border border-indigo-100">
              Profile Settings
            </div>
            <Link 
              to="/account"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors"
            >
              Account Settings
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 sticky top-8">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="h-24 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
                    {getInitials(user.email)}
                  </div>
                  <button className="absolute -bottom-2 -right-2 h-8 w-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 mt-3">{formData.displayName}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Total Rooms
                  </span>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? '...' : userStats.totalRooms}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Total Notes
                  </span>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? '...' : userStats.totalNotes}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last Activity
                  </span>
                  <span className="font-semibold text-gray-900">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is how your name will appear in the app</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                  <input
                    type="text"
                    value={formatDate(user.createdAt)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Password Security */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Password & Security</h2>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Password Change Coming Soon</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Password change functionality will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      disabled
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled
                      className="absolute right-3 top-2.5 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    disabled
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSavePassword}
                  disabled
                  className="flex items-center space-x-2 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                >
                  <Shield className="h-4 w-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </div>

            {/* App Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Mail className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">App Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Your Rooms</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {loadingStats ? '...' : userStats.totalRooms}
                  </div>
                  <div className="text-xs text-blue-600">Organized workspaces</div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Your Notes</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {loadingStats ? '...' : userStats.totalNotes}
                  </div>
                  <div className="text-xs text-green-600">Total created notes</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Features Available</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Room creation and management</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Note creation and editing</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Rich text editor</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Subroom organization</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span>Password change (coming soon)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
