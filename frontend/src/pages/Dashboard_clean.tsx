import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FolderPlus, 
  Folder, 
  Edit3,
  Trash2
} from 'lucide-react';
import { roomAPI } from '../services/api';
import type { Room } from '../types/api';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Try different room endpoints to see which one works
      let roomsData: Room[] = [];
      try {
        roomsData = await roomAPI.getByParent(); // Get root-level rooms only
        console.log('roomAPI.getByParent() result:', roomsData);
      } catch (error) {
        console.log('getByParent failed, trying getAll:', error);
        try {
          roomsData = await roomAPI.getAll(); // Fallback to all rooms
          console.log('roomAPI.getAll() result:', roomsData);
        } catch (error2) {
          console.error('Both room API calls failed:', error2);
          toast.error('Failed to load rooms data');
          return;
        }
      }
      
      setRooms(roomsData);
    } catch (error: any) {
      console.error('Dashboard data loading error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setCreating(true);
      const response = await roomAPI.create({ name: newRoomName.trim() });
      const updatedRooms = [...rooms, response.room];
      setRooms(updatedRooms);
      
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
      
      toast.success('Room deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete room';
      toast.error(message);
    }
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="group relative bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleRoomClick(room._id)}
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
              ))}
            </div>
          )}
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
