import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderPlus, FileText, Trash2, Edit3, Folder, ChevronRight, Home } from 'lucide-react';
import { roomAPI, noteAPI } from '../services/api';
import type { Room, Note } from '../types/api';
import toast from 'react-hot-toast';

const RoomView: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [subrooms, setSubrooms] = useState<Room[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumb, setBreadcrumb] = useState<Room[]>([]);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createType, setCreateType] = useState<'room' | 'note'>('room');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadRoomData();
    }
  }, [roomId]);

  const loadRoomData = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const [roomData, subroomsData, notesData] = await Promise.all([
        roomAPI.getById(roomId),
        roomAPI.getByParent(roomId),
        noteAPI.getByRoom(roomId)
      ]);
      
      setCurrentRoom(roomData);
      setSubrooms(subroomsData);
      setNotes(notesData);
      
      // Build breadcrumb
      if (roomData.path) {
        const breadcrumbRooms = await Promise.all(
          roomData.path.map(id => roomAPI.getById(id))
        );
        setBreadcrumb([...breadcrumbRooms, roomData]);
      } else {
        setBreadcrumb([roomData]);
      }
    } catch (error: any) {
      toast.error('Failed to load room data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !roomId) return;

    try {
      setCreating(true);
      
      if (createType === 'room') {
        const response = await roomAPI.create({ 
          name: newItemName.trim(),
          parentRoom: roomId 
        });
        setSubrooms([...subrooms, response.room]);
        toast.success('Subroom created successfully!');
      } else {
        const response = await noteAPI.create({
          title: newItemName.trim(),
          content: '',
          roomId: roomId
        });
        setNotes([...notes, response.note]);
        toast.success('Note created successfully!');
      }
      
      setNewItemName('');
      setShowCreateModal(false);
    } catch (error: any) {
      const message = error.response?.data?.error || `Failed to create ${createType}`;
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !editingRoom) return;

    try {
      setUpdating(true);
      const response = await roomAPI.update(editingRoom._id, { 
        name: newItemName.trim() 
      });
      
      if (editingRoom._id === roomId) {
        setCurrentRoom(response.room);
      } else {
        setSubrooms(subrooms.map(room => 
          room._id === editingRoom._id ? response.room : room
        ));
      }
      
      setNewItemName('');
      setShowEditModal(false);
      setEditingRoom(null);
      toast.success('Room updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update room';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete "${room.name}"? All contents will be deleted.`)) {
      return;
    }

    try {
      await roomAPI.delete(room._id);
      setSubrooms(subrooms.filter(r => r._id !== room._id));
      toast.success('Room deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete room';
      toast.error(message);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    if (!confirm(`Are you sure you want to delete "${note.title}"?`)) {
      return;
    }

    try {
      await noteAPI.delete(note._id);
      setNotes(notes.filter(n => n._id !== note._id));
      toast.success('Note deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete note';
      toast.error(message);
    }
  };

  const openCreateModal = (type: 'room' | 'note') => {
    setCreateType(type);
    setShowCreateModal(true);
    setNewItemName('');
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setNewItemName(room.name);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Room not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header with Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8">
            <div className="flex-1">
              {/* Breadcrumb */}
              <nav className="flex mb-4" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </button>
                  </li>
                  {breadcrumb.map((room, index) => (
                    <li key={room._id}>
                      <div className="flex items-center">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                        <button
                          onClick={() => {
                            if (index < breadcrumb.length - 1) {
                              navigate(`/room/${room._id}`);
                            }
                          }}
                          className={`ml-1 text-sm font-medium ${
                            index === breadcrumb.length - 1
                              ? 'text-gray-500 cursor-default'
                              : 'text-gray-700 hover:text-indigo-600'
                          }`}
                          disabled={index === breadcrumb.length - 1}
                        >
                          {room.name}
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>

              {/* Room Title and Edit */}
              <div className="flex items-center mb-2">
                <h1 className="text-4xl font-bold text-gray-900 mr-3">{currentRoom.name}</h1>
                <button
                  onClick={() => openEditModal(currentRoom)}
                  className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              </div>
              <p className="text-lg text-gray-600">
                Organize your knowledge with subrooms and notes
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              <button
                onClick={() => openCreateModal('room')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Subroom
              </button>
              <button
                onClick={() => openCreateModal('note')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                New Note
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Folder className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Subrooms</dt>
                    <dd className="text-3xl font-bold text-gray-900">{subrooms.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Notes</dt>
                    <dd className="text-3xl font-bold text-gray-900">{notes.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="space-y-8">
            {/* Subrooms Section */}
            {subrooms.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Subrooms</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {subrooms.map((room) => (
                    <div
                      key={room._id}
                      className="group relative bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => navigate(`/room/${room._id}`)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                                <Folder className="h-5 w-5 text-white" />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 truncate">{room.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                              Created {new Date(room.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Subroom
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(room);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-all duration-200 p-1 rounded-lg hover:bg-indigo-50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRoom(room);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all duration-200 p-1 rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {notes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Notes</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      className="group relative bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => navigate(`/notes/${roomId}?noteId=${note._id}`)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-3">
                              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-3">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 truncate">{note.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                              Updated {new Date(note.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Note
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all duration-200 p-1 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {subrooms.length === 0 && notes.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by creating your first subroom or note to organize your knowledge.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => openCreateModal('room')}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <FolderPlus className="h-5 w-5 mr-2" />
                    Create Subroom
                  </button>
                  <button
                    onClick={() => openCreateModal('note')}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Create Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Create New {createType === 'room' ? 'Subroom' : 'Note'}
              </h3>
              <form onSubmit={handleCreateItem}>
                <div className="mb-6">
                  <label htmlFor="itemName" className="block text-sm font-semibold text-gray-700 mb-2">
                    {createType === 'room' ? 'Subroom' : 'Note'} Name
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    placeholder={`Enter ${createType} name...`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewItemName('');
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newItemName.trim()}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {creating ? 'Creating...' : `Create ${createType === 'room' ? 'Subroom' : 'Note'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Edit Room Name
              </h3>
              <form onSubmit={handleUpdateRoom}>
                <div className="mb-6">
                  <label htmlFor="editRoomName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Name
                  </label>
                  <input
                    id="editRoomName"
                    type="text"
                    placeholder="Enter room name..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingRoom(null);
                      setNewItemName('');
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating || !newItemName.trim()}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {updating ? 'Updating...' : 'Update Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomView;
