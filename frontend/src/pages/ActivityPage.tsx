import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  FileText, 
  Folder, 
  Clock, 
  ArrowLeft,
  Calendar,
  TrendingUp,
  BarChart3,
  Filter
} from 'lucide-react';
import { roomAPI, noteAPI } from '../services/api';
import type { Room, Note } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'rooms' | 'notes'>('all');

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        
        // Load rooms and notes in parallel
        const [roomsData, notesData] = await Promise.all([
          roomAPI.getAll(),
          noteAPI.getAll()
        ]);
        
        setRooms(roomsData);
        setNotes(notesData);
        
      } catch (error) {
        console.error('Error loading activity:', error);
        toast.error('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, []);

  // Combine and sort all activity
  const allActivity = React.useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'room' | 'note';
      title: string;
      subtitle?: string;
      createdAt: Date;
      roomId?: string;
      noteId?: string;
      room?: Room;
    }> = [];

    // Add rooms
    if (filter === 'all' || filter === 'rooms') {
      rooms.forEach(room => {
        activities.push({
          id: room._id,
          type: 'room',
          title: room.name,
          subtitle: 'Room created',
          createdAt: new Date(room.createdAt),
          roomId: room._id
        });
      });
    }

    // Add notes
    if (filter === 'all' || filter === 'notes') {
      notes.forEach(note => {
        const room = rooms.find(r => String(r._id) === String(note.room));
        activities.push({
          id: note._id,
          type: 'note',
          title: note.title || 'Untitled Note',
          subtitle: `Note created in ${room?.name || 'Unknown Room'}`,
          createdAt: new Date(note.createdAt),
          roomId: note.room,
          noteId: note._id,
          room
        });
      });
    }

    // Sort by creation date (newest first)
    return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [rooms, notes, filter]);

  const stats = {
    totalRooms: rooms.length,
    totalNotes: notes.length,
    todayActivity: allActivity.filter(item => {
      const today = new Date();
      const itemDate = item.createdAt;
      return itemDate.toDateString() === today.toDateString();
    }).length,
    thisWeekActivity: allActivity.filter(item => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return item.createdAt >= weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Activity Timeline
              </h1>
              <p className="text-gray-600 mt-1">
                Your complete activity history across all rooms and notes
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Activity</p>
                  <p className="text-xl font-bold text-gray-900">{allActivity.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-xl font-bold text-gray-900">{stats.todayActivity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-xl font-bold text-gray-900">{stats.thisWeekActivity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Today</p>
                  <p className="text-xl font-bold text-gray-900">{user?.email ? 'You' : '0'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              {(['all', 'rooms', 'notes'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filter === filterType
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/80 text-gray-600 hover:bg-white/90'
                  }`}
                >
                  {filterType === 'all' ? 'All Activity' : filterType === 'rooms' ? 'Rooms Only' : 'Notes Only'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
            <span className="text-sm text-gray-500">({allActivity.length} items)</span>
          </div>

          {allActivity.length > 0 ? (
            <div className="space-y-3">
              {allActivity.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'room') {
                      navigate(`/room/${String(item.roomId)}`);
                    } else {
                      navigate(`/notes/${String(item.roomId)}?noteId=${String(item.noteId)}`);
                    }
                  }}
                  className={`flex items-start space-x-3 p-4 rounded-lg transition-colors cursor-pointer ${
                    item.type === 'room'
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400'
                      : 'bg-green-50 hover:bg-green-100 border-l-4 border-green-400'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'room' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {item.type === 'room' ? (
                        <Folder className="h-5 w-5 text-white" />
                      ) : (
                        <FileText className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'room'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type === 'room' ? 'Room' : 'Note'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.subtitle} • {formatTimeAgo(item.createdAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.createdAt.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all' 
                  ? 'Create your first room or note to see activity here'
                  : filter === 'rooms'
                  ? 'Create your first room to see room activity'
                  : 'Create your first note to see note activity'
                }
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
