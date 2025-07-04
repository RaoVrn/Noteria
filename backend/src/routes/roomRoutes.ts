import { Router } from 'express';
import { 
  createRoom, 
  getRooms, 
  getRootRooms,
  getRoomsByParent,
  getRoomById,
  updateRoom,
  deleteRoom 
} from '../controllers/roomController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/rooms - Create a new room (or subroom if parentRoom is provided)
router.post('/', authenticateToken, createRoom);

// GET /api/rooms - Get all rooms for the authenticated user
router.get('/', authenticateToken, getRooms);

// GET /api/rooms/root - Get only root-level rooms (no parent)
router.get('/root', authenticateToken, getRootRooms);

// GET /api/rooms/parent/:parentId - Get subrooms for a specific parent room
router.get('/parent/:parentId', authenticateToken, getRoomsByParent);

// GET /api/rooms/:roomId - Get a specific room by ID
router.get('/:roomId', authenticateToken, getRoomById);

// PUT /api/rooms/:roomId - Update a room
router.put('/:roomId', authenticateToken, updateRoom);

// DELETE /api/rooms/:roomId - Delete a room (and all its subrooms/notes)
router.delete('/:roomId', authenticateToken, deleteRoom);

export default router;
