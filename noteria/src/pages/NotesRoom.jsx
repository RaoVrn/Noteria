import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Tag,
  BookOpen,
  ArrowLeft
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import RichTextEditor from '../components/RichTextEditor'

function NotesRoom({ spaces, setSpaces }) {
  const { spaceId, subspaceId } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingNote, setEditingNote] = useState({ title: '', content: '', tags: [] })
  const [showNewNoteForm, setShowNewNoteForm] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')

  // Get current space and subspace
  const currentSpace = spaces.find(space => space.id === spaceId)
  const currentSubspace = subspaceId 
    ? currentSpace?.subspaces.find(sub => sub.id === subspaceId)
    : null

  // Get notes from current location
  const notes = currentSubspace ? currentSubspace.notes : currentSpace?.notes || []
  const locationName = currentSubspace ? currentSubspace.name : currentSpace?.name || 'Unknown'

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const createNote = () => {
    if (!newNoteTitle.trim()) return

    const newNote = {
      id: uuidv4(),
      title: newNoteTitle.trim(),
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedSpaces = spaces.map(space => {
      if (space.id === spaceId) {
        if (subspaceId) {
          return {
            ...space,
            subspaces: space.subspaces.map(subspace => {
              if (subspace.id === subspaceId) {
                return {
                  ...subspace,
                  notes: [...(subspace.notes || []), newNote]
                }
              }
              return subspace
            })
          }
        } else {
          return {
            ...space,
            notes: [...(space.notes || []), newNote]
          }
        }
      }
      return space
    })

    setSpaces(updatedSpaces)
    localStorage.setItem('noteria_spaces', JSON.stringify(updatedSpaces))
    setNewNoteTitle('')
    setShowNewNoteForm(false)
    setSelectedNote(newNote)
    setIsEditing(true)
    setEditingNote(newNote)
  }

  const saveNote = () => {
    if (!editingNote.title.trim()) return

    const updatedSpaces = spaces.map(space => {
      if (space.id === spaceId) {
        const updateNoteInArray = (notes) => 
          notes.map(note => 
            note.id === editingNote.id 
              ? { ...editingNote, updatedAt: new Date().toISOString() }
              : note
          )

        if (subspaceId) {
          return {
            ...space,
            subspaces: space.subspaces.map(subspace => {
              if (subspace.id === subspaceId) {
                return {
                  ...subspace,
                  notes: updateNoteInArray(subspace.notes || [])
                }
              }
              return subspace
            })
          }
        } else {
          return {
            ...space,
            notes: updateNoteInArray(space.notes || [])
          }
        }
      }
      return space
    })

    setSpaces(updatedSpaces)
    localStorage.setItem('noteria_spaces', JSON.stringify(updatedSpaces))
    setSelectedNote(editingNote)
    setIsEditing(false)
  }

  const deleteNote = (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    const updatedSpaces = spaces.map(space => {
      if (space.id === spaceId) {
        const filterNotes = (notes) => notes.filter(note => note.id !== noteId)

        if (subspaceId) {
          return {
            ...space,
            subspaces: space.subspaces.map(subspace => {
              if (subspace.id === subspaceId) {
                return {
                  ...subspace,
                  notes: filterNotes(subspace.notes || [])
                }
              }
              return subspace
            })
          }
        } else {
          return {
            ...space,
            notes: filterNotes(space.notes || [])
          }
        }
      }
      return space
    })

    setSpaces(updatedSpaces)
    localStorage.setItem('noteria_spaces', JSON.stringify(updatedSpaces))
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!currentSpace) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Space Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Notes List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{locationName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowNewNoteForm(true)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note)
                setIsEditing(false)
              }}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors ${
                selectedNote?.id === note.id ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {note.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center text-xs text-gray-400 mt-2">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNote(note.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No notes found' : 'No notes yet'}
              {!searchTerm && (
                <button
                  onClick={() => setShowNewNoteForm(true)}
                  className="block mx-auto mt-2 text-blue-500 hover:text-blue-600 text-sm"
                >
                  Create your first note
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingNote.title}
                      onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                      className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                      placeholder="Note title..."
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedNote.title}</h1>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Last updated: {formatDate(selectedNote.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveNote}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditingNote(selectedNote)
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setEditingNote(selectedNote)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Edit3 size={16} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 p-4 bg-white dark:bg-gray-800">
              {isEditing ? (
                <RichTextEditor
                  value={editingNote.content}
                  onChange={(content) => setEditingNote({...editingNote, content})}
                  darkMode={document.documentElement.classList.contains('dark')}
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  {selectedNote.content ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      This note is empty. Click Edit to add content.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
            <div className="text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Select a note to view
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a note from the sidebar or create a new one to get started.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Note Modal */}
      {showNewNoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Note</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && createNote()}
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowNewNoteForm(false)
                  setNewNoteTitle('')
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNote}
                disabled={!newNoteTitle.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesRoom
