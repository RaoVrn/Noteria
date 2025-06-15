import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Folder, 
  FolderOpen, 
  BookOpen,
  Settings,
  Search,
  Home
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'

const Sidebar = ({ collapsed }) => {
  const { state, dispatch } = useApp()
  const [expandedSpaces, setExpandedSpaces] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false)
  const [showAddSubspaceModal, setShowAddSubspaceModal] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState('')
  const [newSpaceEmoji, setNewSpaceEmoji] = useState('📁')
  const [newSubspaceName, setNewSubspaceName] = useState('')
  const [newSubspaceEmoji, setNewSubspaceEmoji] = useState('📄')
  const [selectedSpaceId, setSelectedSpaceId] = useState(null)
  const location = useLocation()

  const toggleSpace = (spaceId) => {
    const newExpanded = new Set(expandedSpaces)
    if (newExpanded.has(spaceId)) {
      newExpanded.delete(spaceId)
    } else {
      newExpanded.add(spaceId)
    }
    setExpandedSpaces(newExpanded)
  }

  const handleAddSpace = () => {
    if (newSpaceName.trim()) {
      const newSpace = {
        id: newSpaceName.toLowerCase().replace(/\s+/g, '-'),
        name: newSpaceName,
        emoji: newSpaceEmoji,
        subSpaces: []
      }
      dispatch({ type: 'ADD_SPACE', payload: newSpace })
      setNewSpaceName('')
      setNewSpaceEmoji('📁')
      setShowAddSpaceModal(false)
    }
  }

  const handleAddSubspace = () => {
    if (newSubspaceName.trim() && selectedSpaceId) {
      const newSubSpace = {
        id: newSubspaceName.toLowerCase().replace(/\s+/g, '-'),
        name: newSubspaceName,
        emoji: newSubspaceEmoji
      }
      dispatch({ 
        type: 'ADD_SUBSPACE', 
        payload: { 
          spaceId: selectedSpaceId, 
          subSpace: newSubSpace 
        }
      })
      setNewSubspaceName('')
      setNewSubspaceEmoji('📄')
      setSelectedSpaceId(null)
      setShowAddSubspaceModal(false)
      // Expand the space to show the new subspace
      setExpandedSpaces(prev => new Set([...prev, selectedSpaceId]))
    }
  }

  const openAddSubspaceModal = (spaceId) => {
    setSelectedSpaceId(spaceId)
    setShowAddSubspaceModal(true)
  }

  const filteredSpaces = state.spaces.filter(space => 
    space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.subSpaces?.some(subspace => 
      subspace.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (collapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-4">
        <Link
          to="/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Dashboard"
        >
          <Home className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        {state.spaces.map(space => (
          <Link
            key={space.id}
            to={`/space/${space.id}`}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={space.name}
          >
            <span className="text-lg">{space.emoji}</span>
          </Link>
        ))}
        <button
          onClick={() => setShowAddSpaceModal(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600"
          title="Add Space"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Noteria</h2>
            <button
              onClick={() => setShowAddSpaceModal(true)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search spaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            {/* Dashboard Link */}
            <Link
              to="/dashboard"
              className={`flex items-center px-3 py-2 rounded-lg mb-2 transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Home size={18} className="mr-3" />
              Dashboard
            </Link>

            {/* Spaces */}
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Spaces
              </h3>
              
              {filteredSpaces.map(space => (
                <div key={space.id} className="mb-1">
                  <div className="flex items-center group">
                    <button
                      onClick={() => toggleSpace(space.id)}
                      className="flex items-center flex-1 px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {expandedSpaces.has(space.id) ? (
                        <ChevronDown size={16} className="mr-2 text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="mr-2 text-gray-400" />
                      )}
                      <span className="mr-2 text-lg">{space.emoji}</span>
                      <span className="text-sm text-gray-900 dark:text-white truncate">
                        {space.name}
                      </span>
                    </button>
                    <button
                      onClick={() => openAddSubspaceModal(space.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-opacity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Space Notes and Subspaces */}
                  {expandedSpaces.has(space.id) && (
                    <div className="ml-6 mt-1">
                      <Link
                        to={`/space/${space.id}`}
                        className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                          location.pathname === `/space/${space.id}`
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <BookOpen size={14} className="mr-2" />
                        Notes ({state.notes[space.id]?.length || 0})
                      </Link>

                      {/* Subspaces */}
                      {space.subSpaces?.map(subspace => {
                        const noteCount = state.notes[`${space.id}-${subspace.id}`]?.length || 0
                        return (
                          <Link
                            key={subspace.id}
                            to={`/space/${space.id}/subspace/${subspace.id}`}
                            className={`flex items-center px-3 py-1 rounded text-sm mt-1 transition-colors ${
                              location.pathname === `/space/${space.id}/subspace/${subspace.id}`
                                ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <span className="mr-2">{subspace.emoji}</span>
                            {subspace.name} ({noteCount})
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {filteredSpaces.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No spaces found' : 'No spaces yet'}
                  {!searchTerm && (
                    <button
                      onClick={() => setShowAddSpaceModal(true)}
                      className="block mx-auto mt-2 text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Create your first space
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Total Spaces:</span>
              <span>{state.spaces.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Notes:</span>
              <span>{Object.values(state.notes).flat().length}</span>
            </div>
          </div>
          <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Settings size={16} className="mr-3" />
            Settings
          </button>
        </div>
      </div>

      {/* Add Space Modal */}
      {showAddSpaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Space
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={newSpaceEmoji}
                  onChange={(e) => setNewSpaceEmoji(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="📁"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Space Name
                </label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Web Development"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddSpaceModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSpace}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Space
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subspace Modal */}
      {showAddSubspaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Subspace
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={newSubspaceEmoji}
                  onChange={(e) => setNewSubspaceEmoji(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="📄"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subspace Name
                </label>
                <input
                  type="text"
                  value={newSubspaceName}
                  onChange={(e) => setNewSubspaceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., React Components"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddSubspaceModal(false)
                  setSelectedSpaceId(null)
                  setNewSubspaceName('')
                  setNewSubspaceEmoji('📄')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubspace}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Subspace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
