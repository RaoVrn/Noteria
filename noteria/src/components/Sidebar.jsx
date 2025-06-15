import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { createSpace, createSubspace } from '../supabaseClient';

const Sidebar = ({ collapsed }) => {
  const { state, dispatch } = useApp();
  const [expandedSpaces, setExpandedSpaces] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceEmoji, setNewSpaceEmoji] = useState('📁');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const toggleSpace = (spaceId) => {
    const newExpanded = new Set(expandedSpaces);
    if (newExpanded.has(spaceId)) {
      newExpanded.delete(spaceId);
    } else {
      newExpanded.add(spaceId);
    }
    setExpandedSpaces(newExpanded);
  };

  const handleAddSpace = async () => {
    if (!newSpaceName.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await createSpace(
        state.user.id,
        newSpaceName.trim(),
        newSpaceEmoji
      );

      if (error) throw error;

      if (data && data[0]) {
        dispatch({ type: 'ADD_SPACE', payload: data[0] });
        setNewSpaceName('');
        setNewSpaceEmoji('📁');
        setShowAddSpaceModal(false);
      }
    } catch (error) {
      console.error('Error creating space:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSpaces = state.spaces?.filter(space => 
    space.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (collapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-4">
        <Link to="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <Home className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <button 
          onClick={() => setShowAddSpaceModal(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Plus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spaces</h2>
            <button
              onClick={() => setShowAddSpaceModal(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search spaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 p-2 rounded-lg mb-4 transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Spaces */}
          <div className="space-y-1">
            {filteredSpaces.map((space) => {
              const isExpanded = expandedSpaces.has(space.id);
              const hasSubspaces = space.subspaces && space.subspaces.length > 0;
              const isActive = location.pathname.includes(`/space/${space.id}`);

              return (
                <div key={space.id} className="space-y-1">
                  <div className="flex items-center group">
                    <button
                      onClick={() => toggleSpace(space.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      disabled={!hasSubspaces}
                    >
                      {hasSubspaces ? (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </button>
                    
                    <Link
                      to={`/space/${space.id}`}
                      className={`flex-1 flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        isActive && !location.pathname.includes('/subspace/')
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span className="text-lg">{space.emoji || '📁'}</span>
                      <span className="font-medium truncate">{space.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {space.notes?.length || 0}
                      </span>
                    </Link>
                  </div>

                  {/* Subspaces */}
                  {isExpanded && hasSubspaces && (
                    <div className="ml-6 space-y-1">
                      {space.subspaces.map((subspace) => {
                        const isSubspaceActive = location.pathname === `/space/${space.id}/subspace/${subspace.id}`;
                        
                        return (
                          <Link
                            key={subspace.id}
                            to={`/space/${space.id}/subspace/${subspace.id}`}
                            className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                              isSubspaceActive
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            <span className="text-sm">{subspace.emoji || '📄'}</span>
                            <span className="text-sm truncate">{subspace.name}</span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {subspace.notes?.length || 0}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredSpaces.length === 0 && !searchTerm && (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No spaces yet</p>
              <button
                onClick={() => setShowAddSpaceModal(true)}
                className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Create your first space
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Space Modal */}
      {showAddSpaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Space
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Space Name
                </label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter space name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={newSpaceEmoji}
                  onChange={(e) => setNewSpaceEmoji(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="📁"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddSpaceModal(false);
                  setNewSpaceName('');
                  setNewSpaceEmoji('📁');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSpace}
                disabled={!newSpaceName.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Space'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
