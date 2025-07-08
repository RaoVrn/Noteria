import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Users, Shield, Sparkles, Zap, Lock, BookOpen, Clock, Star, CheckCircle, Globe, Folder, Code, Layers } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FileText,
      title: 'Smart Note Organization',
      description: 'Create notes with rich text formatting, markdown support, and code blocks. Organize everything in rooms for better structure.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Users,
      title: 'Room-Based Collaboration',
      description: 'Create shared spaces for team collaboration. Perfect for project documentation and knowledge sharing.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your notes are protected with secure authentication and private room access controls.',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const benefits = [
    { icon: Sparkles, text: 'Clean, intuitive interface' },
    { icon: Zap, text: 'Lightning-fast search' },
    { icon: Lock, text: 'End-to-end encryption' },
    { icon: Globe, text: 'Access anywhere' },
  ];

  const useCases = [
    {
      icon: BookOpen,
      title: 'Academic Research',
      description: 'Organize research papers, citations, and study notes. Perfect for students and researchers working on multiple projects.',
      features: ['Literature reviews', 'Research methodology', 'Data analysis notes', 'Bibliography management']
    },
    {
      icon: Folder,
      title: 'Software Development',
      description: 'Document your codebase, API specifications, and project requirements. Keep technical documentation organized and accessible.',
      features: ['Code documentation', 'API specifications', 'Project requirements', 'Team knowledge base']
    },
    {
      icon: Clock,
      title: 'Business Operations',
      description: 'Capture meeting notes, project plans, and process documentation. Streamline your business workflows.',
      features: ['Meeting minutes', 'Process documentation', 'Project planning', 'Team communication']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Research Scientist',
      avatar: 'SJ',
      content: 'The room-based organization helps me keep different research projects separate and organized.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Software Engineer',
      avatar: 'MC',
      content: 'Great for taking notes during development. The markdown support is exactly what I needed.',
      rating: 5
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Professor',
      avatar: 'ER',
      content: 'Simple interface that my students can actually use. Perfect for collaborative research.',
      rating: 5
    }
  ];

  const keyFeatures = [
    { 
      icon: Code,
      title: 'Rich Text Editor', 
      description: 'Full markdown support with code syntax highlighting and live preview',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      icon: Users,
      title: 'Team Collaboration', 
      description: 'Work together with your team in shared rooms with real-time updates',
      color: 'bg-green-100 text-green-600'
    },
    { 
      icon: Layers,
      title: 'Smart Organization', 
      description: 'Organize notes by rooms, tags, and categories for easy discovery',
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      icon: Shield,
      title: 'Secure & Private', 
      description: 'Your data is encrypted and protected with secure authentication',
      color: 'bg-red-100 text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-5 py-2 mb-8 border border-indigo-100 shadow-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-indigo-800">Built for Modern Teams</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-8 tracking-tight">
              <span className="block">Organize</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Everything
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform your scattered notes into organized knowledge. 
              <br className="hidden md:block" />
              <span className="text-indigo-600 font-semibold">Room-based organization</span> meets 
              <span className="text-purple-600 font-semibold"> powerful search</span> and 
              <span className="text-blue-600 font-semibold"> seamless collaboration</span>.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                <Link
                  to="/dashboard"
                  className="group relative inline-flex items-center px-10 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-indigo-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                  <span className="relative">Go to Dashboard</span>
                  <ArrowRight className="relative ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group relative inline-flex items-center px-10 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-indigo-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                    <span className="relative">Start Free Today</span>
                    <ArrowRight className="relative ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-10 py-4 text-lg font-bold rounded-2xl text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="group bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors duration-200">
                      <benefit.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 text-center">{benefit.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for modern knowledge workers who need organization, collaboration, and security.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${feature.color}`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
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

      {/* Features Section */}
      <div className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Simple section badge */}
            <div className="inline-flex items-center space-x-2 bg-indigo-50 rounded-full px-6 py-3 mb-8 border border-indigo-100">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">CORE FEATURES</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-indigo-600">Noteria</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, organized, and powerful note-taking designed for modern knowledge workers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                {/* Simple icon container */}
                <div className="mb-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See It In <span className="text-indigo-600">Action</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of organized note-taking with our intuitive interface.
            </p>
          </div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
            {/* Mock App Interface */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500">Noteria Dashboard</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Folder className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-gray-900">Project Alpha</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Development notes and documentation</p>
                  <div className="text-xs text-gray-500">12 notes • 3 collaborators</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-semibold text-gray-900">Research</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Academic papers and research findings</p>
                  <div className="text-xs text-gray-500">8 notes • 1 collaborator</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Clock className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-semibold text-gray-900">Meetings</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Weekly standup and meeting notes</p>
                  <div className="text-xs text-gray-500">15 notes • 5 collaborators</div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Clean, organized, and collaborative - exactly what you need for productive note-taking.
              </p>
              {!user && (
                <Link
                  to="/signup"
                  className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                >
                  Try It Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Perfect for Every <span className="text-indigo-600">Workflow</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a student, researcher, or professional, Noteria adapts to your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl mr-4">
                    <useCase.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{useCase.title}</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {useCase.description}
                </p>
                <ul className="space-y-2">
                  {useCase.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Users <span className="text-indigo-600">Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how Noteria is helping people organize their knowledge and boost productivity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{testimonial.content}"</p>
                
                {/* Decorative element */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 py-20 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJtIDQwIDAgbCAwIDQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CiAgICAgIDxwYXRoIGQ9Im0gMCA0MCBsIDQwIDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4=')] opacity-20"></div>
          
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Organized?
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Start organizing your knowledge with Noteria today. Create your first room and experience 
              the power of structured note-taking.
            </p>
            
            <div className="flex flex-col items-center space-y-8">
              <Link
                to="/signup"
                className="group inline-flex items-center px-10 py-4 text-lg font-bold rounded-xl text-indigo-600 bg-white hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Start Your Journey
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-white/90">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-base font-medium">Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-base font-medium">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-base font-medium">Setup in minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;