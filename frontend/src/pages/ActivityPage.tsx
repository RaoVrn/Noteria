import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Zap, 
  Target, 
  ChevronLeft,
  Sparkles,
  Flame,
  BookOpen,
  LineChart,
  Award
} from 'lucide-react';
import { roomAPI, noteAPI } from '../services/api';
import type { Room, Note } from '../types/api';
import toast from 'react-hot-toast';

const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Room[]>([]);
  const [documents, setDocuments] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'insights' | 'progress' | 'achievements'>('insights');

  // Helper function to calculate learning momentum
  const calculateMomentum = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'blazing hot';
    if (diffInHours < 6) return 'very active';
    if (diffInHours < 24) return 'recently active';
    if (diffInHours < 168) return 'this week';
    return 'earlier';
  };

  useEffect(() => {
    const loadKnowledgeData = async () => {
      try {
        setLoading(true);
        
        // Load workspaces and documents
        const [workspaceData, documentData] = await Promise.all([
          roomAPI.getAll(),
          noteAPI.getAll()
        ]);
        
        setWorkspaces(workspaceData);
        setDocuments(documentData);
        
      } catch (error) {
        console.error('Error loading knowledge data:', error);
        toast.error('Failed to load your knowledge journey');
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeData();
  }, []);

  // Transform data into knowledge insights
  const knowledgeInsights = React.useMemo(() => {
    const insights: Array<{
      id: string;
      type: 'creation' | 'breakthrough' | 'milestone';
      title: string;
      description: string;
      momentum: string;
      createdAt: Date;
      impact: 'high' | 'medium' | 'low';
      workspaceId?: string;
      documentId?: string;
    }> = [];

    // Add workspace insights
    if (viewMode === 'insights' || viewMode === 'progress') {
      workspaces.forEach(workspace => {
        insights.push({
          id: workspace._id,
          type: 'creation',
          title: `Knowledge Space: ${workspace.name}`,
          description: 'New learning environment established',
          momentum: calculateMomentum(new Date(workspace.createdAt)),
          createdAt: new Date(workspace.createdAt),
          impact: 'high',
          workspaceId: workspace._id
        });
      });
    }

    // Add document insights
    if (viewMode === 'insights' || viewMode === 'achievements') {
      documents.forEach(document => {
        const workspace = workspaces.find(w => String(w._id) === String(document.room));
        insights.push({
          id: document._id,
          type: 'breakthrough',
          title: document.title || 'Knowledge Capture',
          description: `Documented in ${workspace?.name || 'Learning Space'}`,
          momentum: calculateMomentum(new Date(document.createdAt)),
          createdAt: new Date(document.createdAt),
          impact: 'medium',
          workspaceId: document.room,
          documentId: document._id
        });
      });
    }

    // Sort by recency and impact
    return insights.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [workspaces, documents, viewMode]);

  const learningMetrics = {
    totalWorkspaces: workspaces.length,
    totalDocuments: documents.length,
    recentActivity: knowledgeInsights.filter(item => {
      const today = new Date();
      const itemDate = item.createdAt;
      return itemDate.toDateString() === today.toDateString();
    }).length,
    weeklyProgress: knowledgeInsights.filter(item => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return item.createdAt >= weekAgo;
    }).length,
    momentum: knowledgeInsights.length > 0 ? 
      calculateMomentum(knowledgeInsights[0].createdAt) : 'getting started'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gradient-to-r from-purple-100 to-orange-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Knowledge Journey Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 hover:bg-white transition-colors shadow-lg"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Knowledge Journey
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Track your learning evolution and intellectual growth
              </p>
            </div>
          </div>

          {/* Learning Momentum Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Knowledge Spaces</p>
                  <p className="text-2xl font-bold text-gray-900">{learningMetrics.totalWorkspaces}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{learningMetrics.totalDocuments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Flow</p>
                  <p className="text-2xl font-bold text-gray-900">{learningMetrics.recentActivity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Weekly Momentum</p>
                  <p className="text-2xl font-bold text-gray-900">{learningMetrics.weeklyProgress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center space-x-3 mb-8">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Journey View:</span>
            <div className="flex space-x-2">
              {(['insights', 'progress', 'achievements'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white/70 text-gray-600 hover:bg-white/90'
                  }`}
                >
                  {mode === 'insights' ? '🧠 Insights' : mode === 'progress' ? '📈 Progress' : '🏆 Achievements'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Journey Timeline */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <Target className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Learning Timeline</h2>
            <span className="text-sm text-gray-500 bg-purple-100 px-3 py-1 rounded-full">
              {knowledgeInsights.length} milestones
            </span>
          </div>

          {knowledgeInsights.length > 0 ? (
            <div className="space-y-6">
              {knowledgeInsights.map((insight, index) => (
                <div 
                  key={insight.id}
                  onClick={() => {
                    if (insight.type === 'creation') {
                      navigate(`/room/${String(insight.workspaceId)}`);
                    } else {
                      navigate(`/notes/${String(insight.workspaceId)}?noteId=${String(insight.documentId)}`);
                    }
                  }}
                  className={`relative flex items-start space-x-4 p-6 rounded-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                    insight.type === 'creation'
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-l-4 border-purple-400'
                      : insight.type === 'breakthrough'
                      ? 'bg-gradient-to-r from-pink-50 to-orange-50 hover:from-pink-100 hover:to-orange-100 border-l-4 border-pink-400'
                      : 'bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border-l-4 border-orange-400'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      insight.type === 'creation' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : insight.type === 'breakthrough'
                        ? 'bg-gradient-to-r from-pink-500 to-orange-500'
                        : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                    }`}>
                      {insight.type === 'creation' ? (
                        <Brain className="h-6 w-6 text-white" />
                      ) : insight.type === 'breakthrough' ? (
                        <Zap className="h-6 w-6 text-white" />
                      ) : (
                        <Award className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {insight.title}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        insight.type === 'creation'
                          ? 'bg-purple-100 text-purple-800'
                          : insight.type === 'breakthrough'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {insight.type === 'creation' ? '🧠 Creation' : insight.type === 'breakthrough' ? '⚡ Breakthrough' : '🏆 Milestone'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {insight.momentum}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        📅 {insight.createdAt.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="flex items-center">
                        <LineChart className="h-3 w-3 mr-1" />
                        Impact: {insight.impact}
                      </span>
                    </div>
                  </div>
                  {/* Timeline connector for all but last item */}
                  {index < knowledgeInsights.length - 1 && (
                    <div className="absolute left-10 top-16 w-0.5 h-6 bg-gradient-to-b from-purple-300 to-pink-300"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">Your Knowledge Journey Awaits</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {viewMode === 'insights' 
                  ? 'Start creating knowledge spaces and documents to see your learning insights here'
                  : viewMode === 'progress'
                  ? 'Begin your learning journey to track your progress and growth'
                  : 'Unlock achievements by consistently building your knowledge base'
                }
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Your Journey
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default ActivityPage;
