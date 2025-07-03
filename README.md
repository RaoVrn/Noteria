# Noteria

A modern, full-stack note-taking application built with React, TypeScript, Node.js, and MongoDB. Organize your notes in rooms and collaborate on projects with a clean, intuitive interface.

## 🚀 Features

- 🔐 **Secure Authentication** - JWT-based user authentication
- 🏠 **Room Organization** - Organize notes in customizable rooms
- 📝 **Rich Note Editing** - Create and edit notes with real-time saving
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔄 **Real-time Updates** - Instant synchronization across the app
- 📱 **Mobile Responsive** - Works perfectly on all devices

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📁 Project Structure

```
Noteria/
├── frontend/           # React TypeScript frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── context/    # React context
│   │   └── types/      # TypeScript types
│   ├── package.json
│   └── README_NEW.md
├── backend/            # Node.js Express backend
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Custom middleware
│   │   └── index.ts    # Server entry point
│   ├── package.json
│   └── README.md
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Noteria
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**Backend .env configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/noteria
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env
```

**Frontend .env configuration:**
```env
VITE_API_URL=http://localhost:5000
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open Your Browser
Navigate to `http://localhost:5173` to see the application.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Rooms
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms` - Create new room
- `DELETE /api/rooms/:roomId` - Delete room

### Notes
- `GET /api/notes/room/:roomId` - Get notes in room
- `POST /api/notes` - Create new note
- `PUT /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note

## 🔒 Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. Token included in subsequent API requests
5. Backend verifies token for protected routes

## 🗃 Database Schema

### User
```typescript
{
  email: string;
  password: string; // hashed
  createdAt: Date;
  updatedAt: Date;
}
```

### Room
```typescript
{
  name: string;
  user: ObjectId; // reference to User
  createdAt: Date;
  updatedAt: Date;
}
```

### Note
```typescript
{
  title: string;
  content: string;
  room: ObjectId; // reference to Room
  user: ObjectId; // reference to User
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Development Scripts

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run clean    # Clean build directory
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the project: `npm run build`
3. Start with: `npm start`
4. Ensure MongoDB is accessible

### Frontend Deployment
1. Update `VITE_API_URL` in `.env`
2. Build the project: `npm run build`
3. Deploy the `dist/` folder to your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access (for cloud MongoDB)

2. **CORS Issues**
   - Ensure backend CORS is configured correctly
   - Check if frontend URL is allowed

3. **Authentication Problems**
   - Clear localStorage and try again
   - Check JWT_SECRET in backend `.env`
   - Verify token expiration

4. **Port Conflicts**
   - Change PORT in backend `.env`
   - Update VITE_API_URL in frontend `.env`

### Getting Help

- Check browser console for frontend errors
- Check terminal output for backend errors
- Verify API endpoints with tools like Postman
- Ensure all environment variables are set correctly

## 🎯 Roadmap

- [ ] Real-time collaboration
- [ ] File attachments
- [ ] Note sharing
- [ ] Search functionality
- [ ] Dark mode
- [ ] Mobile app
- [ ] Note templates
- [ ] Export functionality

---

**Happy coding! 🎉**
