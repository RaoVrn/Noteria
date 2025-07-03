import { Router } from 'express';
import { createRoom, getRooms, deleteRoom } from '../controllers/roomController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/rooms - Create a new room
router.post('/', authenticateToken, createRoom);

// GET /api/rooms - Get all rooms for the authenticated user
router.get('/', authenticateToken, getRooms);

// DELETE /api/rooms/:roomId - Delete a room
router.delete('/:roomId', authenticateToken, deleteRoom);

export default router;
