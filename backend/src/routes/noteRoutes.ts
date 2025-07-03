import { Router } from 'express';
import { createNote, getNotes, updateNote, deleteNote } from '../controllers/noteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/notes - Create a new note
router.post('/', authenticateToken, createNote);

// GET /api/notes/room/:roomId - Get all notes for a specific room
router.get('/room/:roomId', authenticateToken, getNotes);

// PUT /api/notes/:noteId - Update a note
router.put('/:noteId', authenticateToken, updateNote);

// DELETE /api/notes/:noteId - Delete a note
router.delete('/:noteId', authenticateToken, deleteNote);

export default router;
