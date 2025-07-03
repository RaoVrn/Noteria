import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, FileText } from 'lucide-react';
import { noteAPI, roomAPI } from '../services/api';
import { Note, Room } from '../types/api';
import toast from 'react-hot-toast';

const NotesPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadRoomAndNotes();
    }
  }, [roomId]);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setHasUnsavedChanges(false);
    }
  }, [selectedNote]);

  useEffect(() => {
    if (selectedNote) {
      const hasChanges = title !== selectedNote.title || content !== selectedNote.content;
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, content, selectedNote]);

  const loadRoomAndNotes = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const [roomsData, notesData] = await Promise.all([
        roomAPI.getAll(),
        noteAPI.getByRoom(roomId)
      ]);
      
      const currentRoom = roomsData.find(r => r._id === roomId);
      if (!currentRoom) {
        toast.error('Room not found');
        navigate('/dashboard');
        return;
      }
      
      setRoom(currentRoom);
      setNotes(notesData);
      
      if (notesData.length > 0) {
        setSelectedNote(notesData[0]);
      }
    } catch (error: any) {
      toast.error('Failed to load room data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!roomId) return;

    try {
      const response = await noteAPI.create({
        title: 'Untitled Note',
        content: '',
        roomId
      });
      
      const newNote = response.note;
      setNotes([...notes, newNote]);
      setSelectedNote(newNote);
      toast.success('Note created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create note';
      toast.error(message);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      setSaving(true);
      const response = await noteAPI.update(selectedNote._id, {
        title: title.trim() || 'Untitled Note',
        content
      });
      
      const updatedNote = response.note;
      setNotes(notes.map(note => 
        note._id === selectedNote._id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);
      setHasUnsavedChanges(false);
      toast.success('Note saved successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to save note';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await noteAPI.delete(noteId);
      const updatedNotes = notes.filter(note => note._id !== noteId);
      setNotes(updatedNotes);
      
      if (selectedNote?._id === noteId) {
        setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      }
      
      toast.success('Note deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete note';
      toast.error(message);
    }
  };

  const handleNoteSelect = (note: Note) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to switch notes?')) {
        return;
      }
    }
    setSelectedNote(note);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                {room?.name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateNote}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Note
              </button>
              
              {selectedNote && (
                <button
                  onClick={handleSaveNote}
                  disabled={!hasUnsavedChanges || saving}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          {/* Notes Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Notes</h2>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notes.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a note.</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      className={`p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                        selectedNote?._id === note._id
                          ? 'bg-indigo-50 border border-indigo-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleNoteSelect(note)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {note.title || 'Untitled Note'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                          className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Editor */}
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
            {selectedNote ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none placeholder-gray-400"
                  />
                  {hasUnsavedChanges && (
                    <p className="text-sm text-orange-600 mt-1">You have unsaved changes</p>
                  )}
                </div>
                
                <div className="flex-1 p-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your note..."
                    className="w-full h-full resize-none bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No note selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a note from the sidebar or create a new one.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
