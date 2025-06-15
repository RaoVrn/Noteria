import { Link } from 'react-router-dom'
import { 
  Folder, 
  BookOpen, 
  Plus, 
  Calendar, 
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'

function Dashboard() {
  const { state } = useApp()
  const { spaces, notes } = state

  const totalNotes = Object.values(notes).flat().length

  const recentNotes = Object.entries(notes)
    .flatMap(([key, noteList]) => {
      const [spaceId, subSpaceId] = key.split('-')
      const space = spaces.find(s => s.id === spaceId)
      const subSpace = space?.subSpaces?.find(ss => ss.id === subSpaceId)
      
      return noteList.map(note => ({
        ...note,
        spaceName: space?.name || 'Unknown Space',
        subSpaceName: subSpace?.name,
        spaceEmoji: space?.emoji || '📁',
        subSpaceEmoji: subSpace?.emoji
      }))
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your personal knowledge hub
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spaces</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{spaces.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalNotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {recentNotes.filter(note => {
                  const noteDate = new Date(note.updatedAt)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return noteDate >= weekAgo
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spaces Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Spaces</h2>
              <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium cursor-pointer">
                + Add Space
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {spaces.length > 0 ? (
              <div className="space-y-4">
                {spaces.slice(0, 5).map(space => {
                  const spaceNotes = notes[space.id]?.length || 0
                  const subSpaceNotes = space.subSpaces?.reduce((total, subSpace) => 
                    total + (notes[`${space.id}-${subSpace.id}`]?.length || 0), 0) || 0
                  const totalSpaceNotes = spaceNotes + subSpaceNotes
                  
                  return (
                    <Link
                      key={space.id}
                      to={`/space/${space.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{space.emoji}</span>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{space.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {totalSpaceNotes} notes
                            {space.subSpaces?.length > 0 && ` • ${space.subSpaces.length} sub-spaces`}
                          </p>
                        </div>
                      </div>
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </Link>
                  )
                })}
                
                {spaces.length > 5 && (
                  <div className="text-center pt-4">
                    <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium cursor-pointer">
                      View all {spaces.length} spaces
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No spaces yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create your first space to start organizing your notes
                </p>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Space
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Notes</h2>
          </div>
          
          <div className="p-6">
            {recentNotes.length > 0 ? (
              <div className="space-y-4">
                {recentNotes.map(note => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-start">
                      <span className="text-lg mr-3">{note.subSpaceEmoji || note.spaceEmoji}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{note.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {note.subSpaceName ? `${note.spaceName} • ${note.subSpaceName}` : note.spaceName}
                        </p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(note.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start by creating a space and adding your first note
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Create Space
        </button>
        
        <button className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
          <Search className="h-5 w-5 mr-2" />
          Search Notes
        </button>
        
        <button className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
          <Filter className="h-5 w-5 mr-2" />
          Filter by Tags
        </button>
        
        <button className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <TrendingUp className="h-5 w-5 mr-2" />
          Analytics
        </button>
      </div>
    </div>
  )
}

export default Dashboard
