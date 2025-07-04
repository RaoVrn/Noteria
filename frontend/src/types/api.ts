// API Types
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Room {
  _id: string;
  name: string;
  user: string;
  parentRoom?: string; // For subrooms
  path?: string[]; // Array of parent room IDs for breadcrumb
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  room: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API Responses
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

// API Error Response
export interface ApiError {
  error: string;
}

// Room API
export interface CreateRoomRequest {
  name: string;
  parentRoom?: string; // For creating subrooms
}

export interface UpdateRoomRequest {
  name: string;
}

export interface RoomResponse {
  message: string;
  room: Room;
}

// Note API
export interface CreateNoteRequest {
  title: string;
  content: string;
  roomId: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

export interface NoteResponse {
  message: string;
  note: Note;
}
