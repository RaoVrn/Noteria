import { Link } from 'react-router-dom';
import { 
  Folder, 
  BookOpen, 
  Plus, 
  Calendar, 
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

function Dashboard() {
  const { state } = useApp();
  const { spaces, user } = state;

  // Calculate total notes from all spaces
  const totalNotes = spaces.reduce((total, space) => {
    const spaceNotes = space.notes?.length || 0;
    const subspaceNotes = space.subspaces?.reduce((subTotal, subspace) => {
      return subTotal + (subspace.notes?.length || 0);
    }, 0) || 0;
    return total + spaceNotes + subspaceNotes;
  }, 0);

  // Get recent notes from all spaces
  const recentNotes = [];
  spaces.forEach(space => {
    // Add notes from space
    if (space.notes) {
      space.notes.forEach(note => {
        recentNotes.push({
          ...note,
          spaceName: space.name,
          spaceEmoji: space.emoji || '📁',
          spaceId: space.id
        });
      });
    }

    // Add notes from subspaces
    if (space.subspaces) {
      space.subspaces.forEach(subspace => {
        if (subspace.notes) {
          subspace.notes.forEach(note => {
            recentNotes.push({
              ...note,
              spaceName: space.name,
              subSpaceName: subspace.name,
              spaceEmoji: space.emoji || '📁',
              spaceId: space.id,
              subspaceId: subspace.id
            });
          });
        }
      });
    }
  });

  // Sort by updated_at and take the 5 most recent
  const sortedRecentNotes = recentNotes
    .sort((a, b) => new Date(b.updated_at || b.updatedAt) - new Date(a.updated_at || a.updatedAt))
    .slice(0, 5);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your notes today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalNotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
                <Folder className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spaces</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{spaces.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">+{Math.floor(Math.random() * 10)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notes</h2>
                <Link 
                  to="/notes" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {sortedRecentNotes.length > 0 ? (
                <div className="space-y-4">
                  {sortedRecentNotes.map((note) => (
                    <div key={note.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="text-xl">{note.spaceEmoji}</div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={note.subspaceId 
                            ? `/space/${note.spaceId}/subspace/${note.subspaceId}` 
                            : `/space/${note.spaceId}`
                          }
                          className="block"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {note.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {note.spaceName}
                            {note.subSpaceName && ` / ${note.subSpaceName}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(note.updated_at || note.updatedAt)} at {formatTime(note.updated_at || note.updatedAt)}
                          </p>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notes yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Create your first note to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Spaces Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Spaces</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  New Space
                </button>
              </div>
            </div>
            <div className="p-6">
              {spaces.length > 0 ? (
                <div className="space-y-4">
                  {spaces.map((space) => {
                    const spaceNoteCount = (space.notes?.length || 0) + 
                      (space.subspaces?.reduce((count, sub) => count + (sub.notes?.length || 0), 0) || 0);
                    
                    return (
                      <div key={space.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="text-2xl">{space.emoji || '📁'}</div>
                        <div className="flex-1">
                          <Link to={`/space/${space.id}`}>
                            <p className="font-medium text-gray-900 dark:text-white">{space.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {spaceNoteCount} notes
                              {space.subspaces && space.subspaces.length > 0 && 
                                ` • ${space.subspaces.length} subspaces`
                              }
                            </p>
                          </Link>
                        </div>
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No spaces yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Create your first space to organize your notes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
