# Noteria Backend

A robust backend server for the Noteria note-taking application built with Express.js, TypeScript, and MongoDB.

## 🚀 Features

- **Authentication**: User signup and login with JWT tokens
- **Room Management**: Create and manage note rooms
- **Note Creation**: Create and retrieve notes within rooms
- **Security**: Password hashing with bcrypt, JWT authentication
- **Database**: MongoDB with Mongoose ODM
- **TypeScript**: Full TypeScript support for better development experience

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── roomController.ts
│   │   └── noteController.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Room.ts
│   │   └── Note.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── roomRoutes.ts
│   │   └── noteRoutes.ts
│   ├── middleware/
│   │   └── auth.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

## 🛠️ Setup Instructions

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**:
   - Update the `.env` file with your MongoDB URI and JWT secret
   - Make sure MongoDB is running locally or provide a cloud MongoDB URI

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Rooms
- `POST /api/rooms` - Create a new room (requires auth)
- `GET /api/rooms` - Get all user rooms (requires auth)

### Notes
- `POST /api/notes` - Create a new note (requires auth)
- `GET /api/notes/:roomId` - Get all notes in a room (requires auth)

### Health
- `GET /api/health` - Server health check

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/noteria
JWT_SECRET=your_super_secret_jwt_key_here_please_change_in_production
NODE_ENV=development
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Models

### User
- email (string, required, unique)
- password (string, required, hashed)
- timestamps (createdAt, updatedAt)

### Room
- name (string, required)
- user (ObjectId, ref to User)
- timestamps (createdAt, updatedAt)

### Note
- title (string, required)
- content (string, required)
- room (ObjectId, ref to Room)
- user (ObjectId, ref to User)
- timestamps (createdAt, updatedAt)

## 🚦 Getting Started

1. Make sure MongoDB is running on your system
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The server will start on `http://localhost:5000`
5. Check health: `GET http://localhost:5000/api/health`

The server is now ready to handle requests from your Noteria frontend application!
