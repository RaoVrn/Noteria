import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Users, Shield, Sparkles, Zap, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FileText,
      title: 'Organize Notes',
      description: 'Create rooms to organize your notes by topic, project, or any way that works for you.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Users,
      title: 'Collaborate',
      description: 'Share knowledge and work together on projects with room-based organization.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Your notes are private and secure. Only you can access your content.',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const benefits = [
    { icon: Sparkles, text: 'Clean, intuitive interface' },
    { icon: Zap, text: 'Lightning-fast performance' },
    { icon: Lock, text: 'End-to-end security' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJtIDQwIDAgbCAwIDQwIiBzdHJva2U9IiNmMGY0ZjgiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPgogICAgICA8cGF0aCBkPSJtIDAgNDAgbCA0MCAwIiBzdHJva2U9IiNmMGY0ZjgiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+Cjwvc3ZnPg==')] opacity-30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-indigo-100 shadow-sm">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Your Knowledge, Organized</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Noteria
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Your personal knowledge management system. Organize, create, and manage your notes 
              in rooms — like <span className="font-semibold text-gray-800">GitHub for your thoughts and ideas</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Link
                  to="/dashboard"
                  className="group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Benefits badges */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {benefits.map((benefit, index) => (
                <div key={index} className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
                  <benefit.icon className="h-4 w-4 text-indigo-600" />
                  <span className="text-gray-700 font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-indigo-600">Noteria</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, organized, and powerful note-taking designed for modern knowledge workers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 py-20 lg:py-28 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJtIDQwIDAgbCAwIDQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CiAgICAgIDxwYXRoIGQ9Im0gMCA0MCBsIDQwIDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4=')] opacity-20"></div>
          
          <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to organize your knowledge?
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
              Join thousands of users who trust Noteria with their notes and ideas. Start your journey today.
            </p>
            <Link
              to="/signup"
              className="group inline-flex items-center px-10 py-4 text-lg font-bold rounded-xl text-indigo-600 bg-white hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start Your Journey
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
