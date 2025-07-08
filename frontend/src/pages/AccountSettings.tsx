import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { roomAPI, noteAPI } from '../services/api';
import { 
  Settings, 
  Database, 
  Trash2, 
  AlertTriangle, 
  Activity,
  Calendar,
  Clock,
  FileText,
  Folder,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserStats {
  totalRooms: number;
  totalNotes: number;
  storageUsed: string;
  lastLogin: string;
  accountCreated: string;
}

const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [userStats, setUserStats] = useState<UserStats>({
    totalRooms: 0,
    totalNotes: 0,
    storageUsed: '0 KB',
    lastLogin: new Date().toISOString(),
    accountCreated: user?.createdAt || new Date().toISOString()
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      loadAccountStats();
    }
  }, [user]);

  const loadAccountStats = async () => {
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
      
      // Estimate storage usage (rough calculation)
      const estimatedStorage = (rooms.length * 0.5) + (totalNotes * 2); // KB estimate
      const storageDisplay = estimatedStorage < 1000 
        ? `${estimatedStorage.toFixed(1)} KB`
        : `${(estimatedStorage / 1000).toFixed(1)} MB`;
      
      setUserStats({
        totalRooms: rooms.length,
        totalNotes,
        storageUsed: storageDisplay,
        lastLogin: new Date().toISOString(),
        accountCreated: user?.createdAt || new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load account stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    // Since there's no delete account API endpoint yet, we'll just logout
    toast.error('Account deletion feature not yet implemented. Logging you out instead.');
    setTimeout(() => {
      logout();
      navigate('/');
    }, 2000);
  };

  const handleLogoutAllSessions = () => {
    // Since we only have localStorage token management, just logout
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account security and data</p>
          
          {/* Settings Navigation */}
          <div className="flex space-x-1 mt-4 bg-white/50 backdrop-blur-sm rounded-lg p-1 w-fit">
            <Link 
              to="/profile"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors"
            >
              Profile Settings
            </Link>
            <div className="bg-white shadow-sm px-4 py-2 rounded-md text-sm font-medium text-indigo-600 border border-indigo-100">
              Account Settings
            </div>
          </div>
        </div>

        <div className="space-y-8">

          {/* Account Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Account Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Folder className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Total Rooms</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {loadingStats ? '...' : userStats.totalRooms}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Total Notes</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {loadingStats ? '...' : userStats.totalNotes}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Storage Used</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {loadingStats ? '...' : userStats.storageUsed}
                </div>
                <div className="text-xs text-purple-600">Estimated</div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Member Since</span>
                </div>
                <div className="text-sm font-bold text-orange-900">
                  {new Date(userStats.accountCreated).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Your unique account identifier</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                <input
                  type="text"
                  value={formatDate(user.createdAt)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">When you joined Noteria</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                <input
                  type="text"
                  value={formatDate(userStats.lastLogin)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Current session start</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  value={user.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">Internal system identifier</p>
              </div>
            </div>
          </div>

          {/* Session Management */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <LogOut className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Session Management</h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Current Session</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    You are currently logged in. Your session data is stored locally in your browser.
                  </p>
                  <button
                    onClick={handleLogoutAllSessions}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Note:</strong> Advanced session management features like viewing all devices and remote logout will be available in future updates.</p>
            </div>
          </div>

          {/* Data Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Database className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Your Data</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">What you have in Noteria:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Folder className="h-4 w-4 mr-2" />
                    Rooms created
                  </span>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? '...' : userStats.totalRooms}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    Notes written
                  </span>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? '...' : userStats.totalNotes}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Database className="h-4 w-4 mr-2" />
                    Estimated storage
                  </span>
                  <span className="font-semibold text-gray-900">
                    {loadingStats ? '...' : userStats.storageUsed}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Data Export Coming Soon</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    The ability to export your data will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-red-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Account deletion is not yet fully implemented. This action will currently only log you out.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-900">
                        Type <code className="bg-red-100 px-1 rounded">DELETE</code> to confirm:
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== 'DELETE'}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
