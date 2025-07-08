import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FolderPlus, 
  Folder, 
  FileText, 
  TrendingUp, 
  Activity, 
  BarChart3,
  PieChart,
  Zap,
  Target,
  Award,
  ArrowRight,
  Edit3,
  Flame,
  Brain,
  Sparkles,
  Trophy,
  BookOpen,
  Search,
  History,
  Clock,
  Trash2,
  Rocket,
  Lightbulb
} from 'lucide-react';
import { roomAPI, noteAPI } from '../services/api';
import type { Room, Note } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalRooms: number;
  totalNotes: number;
  todayRooms: number;
  todayNotes: number;
  weeklyActivity: number[];
  recentRooms: Room[];
  popularRooms: { room: Room; noteCount: number }[];
  storageUsed: number;
  averageNotesPerRoom: number;
  streakDays: number;
  productivityScore: number;
  mostActiveDay: string;
  achievements: string[];
  recentNotes: Note[];
  allNotes: Note[];
  lastActiveRoom?: Room;
  totalWords: number;
  averageWordsPerNote: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    totalNotes: 0,
    todayRooms: 0,
    todayNotes: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    recentRooms: [],
    popularRooms: [],
    storageUsed: 0,
    averageNotesPerRoom: 0,
    streakDays: 0,
    productivityScore: 0,
    mostActiveDay: 'Mon',
    achievements: [],
    recentNotes: [],
    allNotes: [],
    totalWords: 0,
    averageWordsPerNote: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Test API connection and show helpful error messages
  const testAPIConnection = async () => {
    try {
      // Simple health check - try to get user's rooms
      await roomAPI.getAll();
      return true;
    } catch (error: any) {
      console.error('API Connection test failed:', error);
      
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Cannot connect to server. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        // Redirect handled by axios interceptor
      } else if (error.response?.status === 404) {
        // This might be expected for new users with no rooms
        console.log('404 - User has no rooms yet, this is normal for new users');
      } else {
        toast.error(`Server error: ${error.response?.data?.message || 'Unknown error'}`);
      }
      return false;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Test API connection first
      const isConnected = await testAPIConnection();
      if (!isConnected) {
        console.log('API connection failed, using fallback empty state');
        setRooms([]);
        setStats({
          totalRooms: 0,
          totalNotes: 0,
          todayRooms: 0,
          todayNotes: 0,
          weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
          recentRooms: [],
          popularRooms: [],
          storageUsed: 0,
          averageNotesPerRoom: 0,
          streakDays: 0,
          productivityScore: 0,
          mostActiveDay: 'Mon',
          achievements: [],
          recentNotes: [],
          allNotes: [],
          totalWords: 0,
          averageWordsPerNote: 0
        });
        return;
      }
      
      // Try to get all rooms first
      let roomsData: Room[] = [];
      try {
        roomsData = await roomAPI.getAll();
        console.log('roomAPI.getAll() result:', roomsData);
        console.log('First room structure:', roomsData[0]);
        console.log('First room._id:', roomsData[0]?._id, 'type:', typeof roomsData[0]?._id);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
        // If getAll fails, try getByParent with no parent (root rooms)
        try {
          roomsData = await roomAPI.getByParent();
          console.log('roomAPI.getByParent() result:', roomsData);
        } catch (error2) {
          console.error('Both room API calls failed:', error2);
          // Don't show error toast immediately, continue with empty array
          console.log('Continuing with empty rooms array');
          roomsData = [];
        }
      }
      
      setRooms(roomsData);
      
      // Calculate comprehensive stats
      const stats = await calculateStats(roomsData);
      console.log('Calculated stats:', stats);
      setStats(stats);
    } catch (error: any) {
      console.error('Dashboard data loading error:', error);
      // Only show error if it's a critical failure
      if (error.message && !error.message.includes('404')) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };
  const calculateRealWeeklyActivity = (rooms: Room[], notes: Note[]): number[] => {
    try {
      const today = new Date();
      const weeklyActivity = Array(7).fill(0);
      
      // Count rooms created in the last 7 days
      (rooms || []).forEach(room => {
        if (room && room.createdAt) {
          const createdDate = new Date(room.createdAt);
          const daysAgo = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysAgo >= 0 && daysAgo < 7) {
            const dayIndex = 6 - daysAgo; // Most recent day is index 6
            weeklyActivity[dayIndex]++;
          }
        }
      });
      
      // Count notes created in the last 7 days
      (notes || []).forEach(note => {
        if (note && note.createdAt) {
          const createdDate = new Date(note.createdAt);
          const daysAgo = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysAgo >= 0 && daysAgo < 7) {
            const dayIndex = 6 - daysAgo; // Most recent day is index 6
            weeklyActivity[dayIndex]++;
          }
        }
      });

      return weeklyActivity;
    } catch (error) {
      console.error('Error calculating weekly activity:', error);
      return Array(7).fill(0);
    }
  };

  const calculateRealStreak = (rooms: Room[], notes: Note[]): number => {
    try {
      const today = new Date();
      const allItems = [...(rooms || []), ...(notes || [])].filter(item => item && item.createdAt);
      
      if (allItems.length === 0) return 0;
      
      allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      let streak = 0;
      let currentDate = new Date(today);
      currentDate.setHours(0, 0, 0, 0);
      
      // Check each day backwards from today
      for (let i = 0; i < 30; i++) { // Check up to 30 days
        const dateStr = currentDate.toISOString().split('T')[0];
        const hasActivity = allItems.some(item => {
          try {
            const itemDate = new Date(item.createdAt);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.toISOString().split('T')[0] === dateStr;
          } catch (error) {
            return false;
          }
        });
        
        if (hasActivity) {
          streak++;
        } else {
          break; // Streak is broken
        }
        
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const calculateStats = async (roomsData: Room[]): Promise<DashboardStats> => {
    console.log('Calculating stats for rooms:', roomsData);
    const today = new Date().toDateString();
    const todayRooms = roomsData.filter(room => 
      new Date(room.createdAt).toDateString() === today
    ).length;

    let totalNotes = 0;
    let todayNotes = 0;
    let allNotes: Note[] = [];
    const popularRooms: { room: Room; noteCount: number }[] = [];

    // Get notes for each room
    for (const room of roomsData) {
      try {
        const roomId = String(room._id); // Ensure it's a string
        console.log(`Fetching notes for room ${roomId} (${room.name})`);
        const notes = await noteAPI.getByRoom(roomId);
        console.log(`Found ${notes.length} notes for room ${room.name}:`, notes);
        totalNotes += notes.length;
        allNotes = [...allNotes, ...notes];
        
        const todayNotesInRoom = notes.filter(note => 
          new Date(note.createdAt).toDateString() === today
        ).length;
        todayNotes += todayNotesInRoom;

        popularRooms.push({ room, noteCount: notes.length });
      } catch (error) {
        console.log(`Failed to fetch notes for room ${room.name}:`, error);
        // Skip if room has no notes or error occurred
        popularRooms.push({ room, noteCount: 0 });
      }
    }

    console.log('Total notes found:', totalNotes);
    console.log('All notes:', allNotes);

    // Sort rooms by note count
    popularRooms.sort((a, b) => b.noteCount - a.noteCount);

    // Sort notes by creation date for recent notes
    allNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentNotes = allNotes.slice(0, 5);

    // Calculate word statistics
    const totalWords = allNotes.reduce((total, note) => {
      // Estimate words from content (rough calculation)
      const wordCount = note.content ? note.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length : 0;
      return total + wordCount;
    }, 0);
    const averageWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

    // Find last active room (most recently updated)
    const lastActiveRoom = roomsData.length > 0 ? roomsData[0] : undefined;

    // Calculate real weekly activity based on actual creation dates
    const weeklyActivity = calculateRealWeeklyActivity(roomsData, allNotes);

    // Calculate additional metrics
    const averageNotesPerRoom = roomsData.length > 0 ? Math.round(totalNotes / roomsData.length * 10) / 10 : 0;
    const streakDays = calculateRealStreak(roomsData, allNotes);
    const productivityScore = Math.min(100, Math.round((totalNotes * 2 + roomsData.length * 5) / Math.max(1, 7) * 10));
    
    // Find most active day based on real data
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxActivityIndex = weeklyActivity && weeklyActivity.length > 0 ? 
      weeklyActivity.indexOf(Math.max(...weeklyActivity)) : 0;
    const mostActiveDay = dayNames[maxActivityIndex] || 'Mon';

    // Generate achievements based on activity
    const achievements: string[] = [];
    if (roomsData.length >= 5) achievements.push('Room Master');
    if (totalNotes >= 10) achievements.push('Note Taker');
    if (streakDays >= 3) achievements.push('Consistent Creator');
    if (productivityScore >= 75) achievements.push('Productivity Star');
    if (popularRooms[0]?.noteCount >= 5) achievements.push('Content Creator');

    const finalStats = {
      totalRooms: roomsData.length,
      totalNotes,
      todayRooms,
      todayNotes,
      weeklyActivity,
      recentRooms: roomsData.slice(0, 3),
      popularRooms: popularRooms.slice(0, 3),
      storageUsed: (roomsData.length * 0.5 + totalNotes * 2), // Estimated KB
      averageNotesPerRoom,
      streakDays,
      productivityScore,
      mostActiveDay,
      achievements,
      recentNotes,
      allNotes,
      lastActiveRoom,
      totalWords,
      averageWordsPerNote
    };

    console.log('Final calculated stats:', finalStats);
    return finalStats;
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setCreating(true);
      const response = await roomAPI.create({ name: newRoomName.trim() });
      const updatedRooms = [...rooms, response.room];
      setRooms(updatedRooms);
      
      // Update stats
      const newStats = await calculateStats(updatedRooms);
      setStats(newStats);
      
      setNewRoomName('');
      setShowCreateModal(false);
      toast.success('Room created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create room';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room? All notes in this room will be deleted.')) {
      return;
    }

    try {
      await roomAPI.delete(roomId);
      const updatedRooms = rooms.filter(room => room._id !== roomId);
      setRooms(updatedRooms);
      
      // Update stats
      const newStats = await calculateStats(updatedRooms);
      setStats(newStats);
      
      toast.success('Room deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete room';
      toast.error(message);
    }
  };

  const handleRoomClick = (roomId: string) => {
    console.log('handleRoomClick called with:', roomId, typeof roomId);
    const cleanRoomId = String(roomId);
    console.log('cleanRoomId:', cleanRoomId);
    navigate(`/room/${cleanRoomId}`);
  };

  const formatStorageSize = (kb: number) => {
    if (!kb || isNaN(kb)) return '0 KB';
    if (kb < 1000) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1000).toFixed(1)} MB`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const ActivityChart = ({ data }: { data: number[] }) => {
    const maxValue = Math.max(...data, 1);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <div className="flex items-end space-x-2 h-24">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-sm min-h-[4px]"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-500 mt-2">{days[index]}</span>
          </div>
        ))}
      </div>
    );
  };

  const CircularProgress = ({ value, max, size = 60, strokeWidth = 8, color = 'indigo' }: {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (value / max) * circumference;
    
    const colorClasses = {
      indigo: 'stroke-indigo-500',
      green: 'stroke-green-500',
      purple: 'stroke-purple-500',
      orange: 'stroke-orange-500'
    };

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{Math.round((value / max) * 100)}%</span>
        </div>
      </div>
    );
  };

  const DonutChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    // Handle case where total is 0
    if (total === 0) {
      return (
        <div className="relative w-32 h-32">
          <svg width="128" height="128" className="transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="48"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="16"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-32 h-32">
        <svg width="128" height="128" className="transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="48"
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth="16"
          />
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const strokeDasharray = `${percentage * 3.02} 301.59`;
            const strokeDashoffset = -cumulativePercentage * 3.02;
            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx="64"
                cy="64"
                r="48"
                fill="transparent"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">          {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {getGreeting()}, {user?.email?.split('@')[0] || 'User'}! 👋
              </h1>
              <p className="text-lg text-gray-600 mb-4">Here's what's happening in your knowledge workspace</p>
              
              {/* Quick navigation shortcuts */}
              <div className="flex flex-wrap gap-2">
                {stats.lastActiveRoom && (
                  <button
                    onClick={() => stats.lastActiveRoom && navigate(`/room/${String(stats.lastActiveRoom._id)}`)}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Continue: {stats.lastActiveRoom.name}
                  </button>
                )}
                {stats.recentNotes.length > 0 && (
                  <button
                    onClick={() => navigate(`/notes/${String(stats.recentNotes[0].room)}?noteId=${String(stats.recentNotes[0]._id)}`)}
                    className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full hover:bg-green-200 transition-colors"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Latest Note
                  </button>
                )}
                <button
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors"
                >
                  <Folder className="h-3 w-3 mr-1" />
                  View All Rooms
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => {
                  if (stats.recentRooms.length > 0) {
                    navigate(`/notes/${String(stats.recentRooms[0]._id)}`);
                  } else {
                    toast.error('Create a room first!');
                  }
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Quick Note
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Room
              </button>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Folder className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRooms || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Notes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalNotes || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Created Today</p>
                  <p className="text-2xl font-bold text-gray-900">{(stats.todayRooms || 0) + (stats.todayNotes || 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Storage</p>
                  <p className="text-2xl font-bold text-gray-900">{formatStorageSize(stats.storageUsed)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Productivity Score */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Productivity</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">{stats.streakDays || 0} day streak</span>
                </div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <CircularProgress value={stats.productivityScore || 0} max={100} size={80} color="purple" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Most active on <span className="font-semibold text-purple-600">{stats.mostActiveDay}</span></p>
              </div>
            </div>

            {/* Room Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <PieChart className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Distribution</h3>
              </div>
              <div className="flex items-center justify-center mb-4">
                <DonutChart data={[
                  { label: 'Active Rooms', value: stats.popularRooms?.filter(r => r.noteCount > 0).length || 0, color: '#10b981' },
                  { label: 'Empty Rooms', value: Math.max(0, (stats.totalRooms || 0) - (stats.popularRooms?.filter(r => r.noteCount > 0).length || 0)), color: '#e5e7eb' }
                ]} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg. {stats.averageNotesPerRoom || 0} notes per room</p>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              </div>
              <div className="space-y-2">
                {(stats.achievements && stats.achievements.length > 0) ? stats.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">{achievement}</span>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Start creating to unlock achievements!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Activity Chart & Contribution Graph */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Activity Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
                </div>
                <span className="text-sm text-gray-500">Last 7 days</span>
              </div>
              <ActivityChart data={stats.weeklyActivity || [0, 0, 0, 0, 0, 0, 0]} />
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-2" />
                <span>Total activity: {(stats.weeklyActivity || []).reduce((a, b) => a + b, 0)} interactions</span>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              
              {stats.recentNotes.length > 0 || stats.recentRooms.length > 0 ? (
                <div className="space-y-3">
                  {/* Recent Notes */}
                  {stats.recentNotes.slice(0, 3).map(note => {
                    const room = rooms.find(r => String(r._id) === String(note.room));
                    return (
                      <div key={note._id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                           onClick={() => navigate(`/notes/${String(note.room)}?noteId=${String(note._id)}`)}>
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {note.title || 'Untitled Note'}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            in {room?.name || 'Unknown Room'} • {formatTimeAgo(new Date(note.createdAt))}
                          </p>
                          {note.content && (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {note.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Recent Rooms */}
                  {stats.recentRooms.slice(0, 2).map(room => (
                    <div key={room._id} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                         onClick={() => navigate(`/room/${String(room._id)}`)}>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Folder className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{room.name}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Room
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Created {formatTimeAgo(new Date(room.createdAt))}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 italic">
                          Last modified {formatTimeAgo(new Date(room.updatedAt))}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {stats.recentNotes.length > 3 && (
                    <div className="text-center pt-2">
                      <button 
                        onClick={() => navigate('/activity')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View all activity →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Create a room or note to see activity here</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Shortcuts */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <FolderPlus className="h-4 w-4 text-indigo-600 mr-3" />
                    <div className="text-left">
                      <span className="text-sm font-medium text-indigo-900 block">Create New Room</span>
                      <span className="text-xs text-indigo-600">Start a new project space</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => {
                    if (stats.recentRooms.length > 0) {
                      navigate(`/notes/${String(stats.recentRooms[0]._id)}`);
                    } else {
                      toast.error('Create a room first!');
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-green-600 mr-3" />
                    <div className="text-left">
                      <span className="text-sm font-medium text-green-900 block">Quick Note</span>
                      <span className="text-xs text-green-600">Write in recent room</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </button>
                
                {stats.lastActiveRoom && (
                  <button
                    onClick={() => stats.lastActiveRoom && navigate(`/room/${String(stats.lastActiveRoom._id)}`)}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center">
                      <History className="h-4 w-4 text-blue-600 mr-3" />
                      <div className="text-left">
                        <span className="text-sm font-medium text-blue-900 block">Continue: {stats.lastActiveRoom.name}</span>
                        <span className="text-xs text-blue-600">Resume your work</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {/* Global Search */}
                <button
                  onClick={() => {
                    const searchTerm = prompt('Search rooms and notes:');
                    if (searchTerm?.trim()) {
                      // For now, we'll search room names - could be enhanced with backend search
                      const foundRoom = rooms.find(room => 
                        room.name.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      if (foundRoom) {
                        navigate(`/room/${String(foundRoom._id)}`);
                      } else {
                        toast.error('No matching rooms found');
                      }
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-purple-600 mr-3" />
                    <div className="text-left">
                      <span className="text-sm font-medium text-purple-900 block">Search Everything</span>
                      <span className="text-xs text-purple-600">Find rooms and notes</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </button>
                
                {/* Keyboard Shortcuts */}
                <button
                  onClick={() => {
                    toast('Keyboard Shortcuts:\n⌘+N: New note\n⌘+K: Quick search\n⌘+⇧+R: New room\n⌘+/: Toggle sidebar', {
                      duration: 6000,
                      icon: '⌨️'
                    });
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-gray-600 mr-3" />
                    <div className="text-left">
                      <span className="text-sm font-medium text-gray-900 block">Shortcuts</span>
                      <span className="text-xs text-gray-600">View keyboard shortcuts</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    {(stats.recentRooms.length + stats.recentNotes.length > 0) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Updates</h3>
                </div>
                {(stats.recentRooms.length + stats.recentNotes.length > 0) && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {stats.recentRooms.length + stats.recentNotes.length} new
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Show most recent rooms */}
                {stats.recentRooms.slice(0, 2).map((room) => (
                  <div key={room._id} 
                       onClick={() => navigate(`/room/${String(room._id)}`)}
                       className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FolderPlus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-900">
                          New room: {room.name}
                        </p>
                        <p className="text-xs text-blue-700">
                          Created {formatTimeAgo(new Date(room.createdAt))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show most recent notes */}
                {stats.recentNotes.slice(0, 2).map((note) => {
                  const room = rooms.find(r => String(r._id) === String(note.room));
                  return (
                    <div key={note._id} 
                         onClick={() => navigate(`/notes/${String(note.room)}?noteId=${String(note._id)}`)}
                         className="p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg hover:bg-green-100 transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-900">
                            New note: {note.title || 'Untitled'}
                          </p>
                          <p className="text-xs text-green-700">
                            in {room?.name || 'Unknown Room'} • {formatTimeAgo(new Date(note.createdAt))}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Welcome tip for new users */}
                {stats.recentRooms.length === 0 && stats.recentNotes.length === 0 && (
                  <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-900">
                          Welcome to Noteria!
                        </p>
                        <p className="text-xs text-purple-700">
                          Create your first room to get started
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* View all button - only show if there are items */}
                {(stats.recentRooms.length > 2 || stats.recentNotes.length > 2 || (stats.recentRooms.length > 0 || stats.recentNotes.length > 0)) && (
                  <div className="pt-3 border-t border-gray-200">
                    <button 
                      onClick={() => navigate('/activity')}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium w-full text-center transition-colors"
                    >
                      View all activity →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent & Popular Rooms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Recent Rooms */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recently Created</h2>
            </div>
            <div className="space-y-3">
              {stats.recentRooms.length > 0 ? stats.recentRooms.map((room) => {
                console.log('Recent room:', room, 'ID:', room._id, 'type:', typeof room._id);
                return (
                <div 
                  key={room._id}
                  onClick={() => {
                    console.log('Clicking on room:', room._id, typeof room._id);
                    handleRoomClick(String(room._id));
                  }}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <Folder className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate">{room.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
                );
              }) : (
                <p className="text-gray-500 text-sm text-center py-4">No rooms created yet</p>
              )}
            </div>
          </div>

          {/* Popular Rooms */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <PieChart className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Most Active Rooms</h2>
            </div>
            <div className="space-y-3">
              {stats.popularRooms.length > 0 ? stats.popularRooms.map((item, index) => {
                console.log('Popular room:', item.room, 'ID:', item.room._id, 'type:', typeof item.room._id);
                return (
                <div 
                  key={item.room._id}
                  onClick={() => {
                    console.log('Clicking on popular room:', item.room._id, typeof item.room._id);
                    handleRoomClick(String(item.room._id));
                  }}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-xs">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate">{item.room.name}</p>
                      <p className="text-xs text-gray-500">{item.noteCount} notes</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
                );
              }) : (
                <p className="text-gray-500 text-sm text-center py-4">No rooms with notes yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Writing Insights */}
        {stats.totalWords > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Edit3 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Writing Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">Total Words</span>
                  </div>
                  <span className="text-lg font-bold text-green-800">{stats.totalWords.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Avg per Note</span>
                  </div>
                  <span className="text-lg font-bold text-blue-800">{stats.averageWordsPerNote}</span>
                </div>
                {stats.totalWords > 1000 && (
                  <div className="p-3 bg-yellow-50 rounded-lg text-center">
                    <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                    <span className="text-xs font-medium text-yellow-800">
                      {stats.totalWords > 10000 ? 'Prolific Writer!' : 'Active Writer!'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Knowledge Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((stats.totalNotes / Math.max(stats.totalRooms, 1)) * 10) / 10}
                  </div>
                  <div className="text-sm text-gray-600">Notes per Room</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.popularRooms.filter(r => r.noteCount > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Active Rooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((stats.todayNotes + stats.todayRooms) * 100) / 100}
                  </div>
                  <div className="text-sm text-gray-600">Today's Creations</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="text-sm font-semibold text-orange-600">{formatStorageSize(stats.storageUsed)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most Active Day</span>
                  <span className="text-sm font-semibold text-indigo-600">{stats.mostActiveDay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Streak Days</span>
                  <div className="flex items-center">
                    <Flame className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm font-semibold text-orange-600">{stats.streakDays}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => navigate('/profile-settings')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      View detailed stats <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started for New Users */}
        {stats.totalRooms === 0 && (
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Welcome to Noteria! 🚀</h3>
                  <p className="text-blue-100">Your knowledge management journey starts here</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FolderPlus className="h-5 w-5" />
                    <span className="font-semibold">1. Create Rooms</span>
                  </div>
                  <p className="text-sm text-blue-100">Organize your projects into dedicated spaces</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Edit3 className="h-5 w-5" />
                    <span className="font-semibold">2. Add Notes</span>
                  </div>
                  <p className="text-sm text-blue-100">Write rich text notes with formatting</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Search className="h-5 w-5" />
                    <span className="font-semibold">3. Search & Find</span>
                  </div>
                  <p className="text-sm text-blue-100">Quickly find any content across rooms</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create First Room</span>
                </button>
                
                <button
                  onClick={() => {
                    toast('� Pro Tips:\n• Use Ctrl+K for quick search\n• Drag files into notes\n• Use ## for headers in notes\n• Pin important rooms', {
                      duration: 8000,
                    });
                  }}
                  className="flex-1 bg-transparent hover:bg-white/10 border border-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Lightbulb className="h-5 w-5" />
                  <span>View Tips</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Rooms Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Folder className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">All Rooms</h2>
            <span className="text-sm text-gray-500">({rooms.length})</span>
          </div>
          
          {rooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <FolderPlus className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Get started by creating your first room to organize your notes and ideas.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rooms.map((room) => {
                console.log('All rooms grid - room:', room, 'ID:', room._id, 'type:', typeof room._id);
                return (
                <div
                  key={room._id}
                  className="group relative bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => {
                    console.log('Clicking on grid room:', room._id, typeof room._id);
                    handleRoomClick(String(room._id));
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Folder className="h-5 w-5 text-white" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all duration-200 p-1 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{room.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Created {new Date(room.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Room
                      </span>
                      <Edit3 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enhanced Footer with Real Data */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Usage Stats */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Usage</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Rooms:</span>
                  <span className="font-medium">{stats.totalRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Notes:</span>
                  <span className="font-medium">{stats.totalNotes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Today:</span>
                  <span className="font-medium">{stats.todayRooms + stats.todayNotes}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Week:</span>
                  <span className="font-medium">{stats.weeklyActivity.reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => {
                    if (stats.recentRooms.length > 0) {
                      navigate(`/room/${String(stats.recentRooms[0]._id)}`);
                    } else {
                      toast.error('No rooms available. Create your first room!');
                    }
                  }}
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  → All Notes
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  → New Room
                </button>
                <button
                  onClick={() => {
                    toast('⚙️ Profile Settings feature coming soon!', {
                      icon: '⚙️',
                      duration: 4000,
                    });
                  }}
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  → Profile Settings
                </button>
                <button
                  onClick={() => {
                    toast('📤 Export Data feature coming soon!', {
                      icon: '📤',
                      duration: 4000,
                    });
                  }}
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  → Export Data
                </button>
              </div>
            </div>

            {/* System Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">System</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-medium">v1.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Sync:</span>
                  <span className="font-medium">Just now</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="font-medium">{formatStorageSize(stats.storageUsed)}</span>
                </div>
              </div>
            </div>

            {/* Community & Support */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Community</h4>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => {
                    toast('📝 Give Feedback:\nHelp us improve Noteria by sharing your thoughts!', {
                      duration: 5000,
                    });
                  }}
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  → Give Feedback
                </button>
                <button
                  onClick={() => {
                    toast('📚 Documentation:\nLearn how to make the most of Noteria!', {
                      duration: 5000,
                    });
                  }}
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  → Documentation
                </button>
                <button
                  onClick={() => {
                    toast('🆘 Support:\nNeed help? We\'re here for you!', {
                      duration: 5000,
                    });
                  }}
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  → Support
                </button>
                <span className="block text-gray-500 text-xs pt-2">
                  Made with ❤️ for knowledge workers
                </span>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <span>© 2025 Noteria. Made with </span>
              <span className="text-red-500 mx-1">♥</span>
              <span>for knowledge workers.</span>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="flex items-center text-xs text-gray-500">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create New Room</h3>
                <form onSubmit={handleCreateRoom}>
                  <div className="mb-6">
                    <label htmlFor="roomName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Room Name
                    </label>
                    <input
                      id="roomName"
                      type="text"
                      placeholder="Enter room name..."
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewRoomName('');
                      }}
                      className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !newRoomName.trim()}
                      className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {creating ? 'Creating...' : 'Create Room'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
