# Noteria Frontend

A modern React TypeScript application for the Noteria note-taking platform.

## Features

- ✨ Modern React 19 with TypeScript
- 🎨 Beautiful UI with Tailwind CSS
- 🔐 JWT-based authentication
- 📱 Responsive design
- 🚀 Fast development with Vite
- 🔥 Hot reload and instant updates
- 📝 Rich note editing experience
- 🏠 Room-based organization

## Tech Stack

- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router Dom** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Beautiful icons

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file if needed:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   ├── ProtectedRoute.tsx # Route protection
│   └── Sidebar.tsx     # Sidebar component
├── context/            # React context providers
│   ├── auth.ts         # Auth context types
│   └── AuthContext.tsx # Auth state management
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Login page
│   ├── NotesPage.tsx   # Notes management
│   └── Signup.tsx      # Registration page
├── routes/             # Routing configuration
│   └── AppRoutes.tsx   # App routes definition
├── services/           # API services
│   └── api.ts          # API client and endpoints
├── types/              # TypeScript type definitions
│   └── api.ts          # API response types
├── App.tsx             # Main app component
└── main.tsx           # App entry point
```

## Key Features

### Authentication
- User registration and login
- JWT token management
- Protected routes
- Automatic token refresh handling

### Room Management
- Create and organize rooms
- Delete rooms with confirmation
- Room-based note organization

### Note Management
- Rich text note editing
- Auto-save functionality
- Note creation and deletion
- Real-time content updates

### UI/UX
- Modern, clean design
- Responsive layout
- Loading states
- Error handling
- Toast notifications
- Keyboard shortcuts

## API Integration

The frontend communicates with the backend API through:

- **Auth endpoints**: `/api/auth/login`, `/api/auth/signup`
- **Room endpoints**: `/api/rooms` (GET, POST, DELETE)
- **Note endpoints**: `/api/notes` (GET, POST, PUT, DELETE)

## Development Tips

1. **Hot Reload**: Changes are reflected instantly
2. **TypeScript**: Full type checking and IntelliSense
3. **Error Boundaries**: Graceful error handling
4. **Performance**: Optimized with React 19 features

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting platform
3. Configure environment variables for production

## Contributing

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Add proper error handling
4. Write meaningful commit messages
5. Test your changes thoroughly

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify API endpoints

2. **Authentication Problems**
   - Clear localStorage
   - Check JWT token validity
   - Verify user permissions

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all imports

### Getting Help

- Check browser console for errors
- Review network tab for API calls
- Ensure backend is responding correctly
