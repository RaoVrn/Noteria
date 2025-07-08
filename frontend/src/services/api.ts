import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  Room,
  Note,
  CreateRoomRequest,
  UpdateRoomRequest,
  RoomResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteResponse,
} from '../types/api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Room API
export const roomAPI = {
  getAll: async (): Promise<Room[]> => {
    const response = await api.get('/rooms');
    return response.data.rooms;
  },

  getByParent: async (parentRoomId?: string): Promise<Room[]> => {
    const url = parentRoomId ? `/rooms/parent/${parentRoomId}` : '/rooms/root';
    const response = await api.get(url);
    return response.data.rooms;
  },

  getById: async (roomId: string): Promise<Room> => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data.room;
  },

  create: async (data: CreateRoomRequest): Promise<RoomResponse> => {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  update: async (roomId: string, data: UpdateRoomRequest): Promise<RoomResponse> => {
    const response = await api.put(`/rooms/${roomId}`, data);
    return response.data;
  },

  delete: async (roomId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },
};

// Note API
export const noteAPI = {
  getAll: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data.notes;
  },

  getByRoom: async (roomId: string): Promise<Note[]> => {
    const response = await api.get(`/notes/room/${roomId}`);
    return response.data.notes;
  },

  create: async (data: CreateNoteRequest): Promise<NoteResponse> => {
    const response = await api.post('/notes', data);
    return response.data;
  },

  update: async (noteId: string, data: UpdateNoteRequest): Promise<NoteResponse> => {
    const response = await api.put(`/notes/${noteId}`, data);
    return response.data;
  },

  delete: async (noteId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },
};

export default api;
