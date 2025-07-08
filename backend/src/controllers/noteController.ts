import { Request, Response } from 'express';
import { Note } from '../models/Note';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, roomId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate required fields
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Create new note
    const note = new Note({
      title: title || 'Untitled Note',
      content: content || '',
      room: roomId,
      user: userId
    });

    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        _id: note._id,
        title: note.title,
        content: note.content,
        room: note.room,
        user: note.user,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all notes for the specified room and authenticated user
    const notes = await Note.find({ room: roomId, user: userId })
      .populate('room', 'name')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Notes retrieved successfully',
      notes: notes.map(note => ({
        _id: note._id,
        title: note.title,
        content: note.content,
        room: note.room,
        user: note.user,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all notes for the authenticated user across all rooms
    const notes = await Note.find({ user: userId })
      .populate('room', 'name')
      .sort({ createdAt: -1 });

    res.json({
      message: 'All notes retrieved successfully',
      notes: notes.map(note => ({
        _id: note._id,
        title: note.title,
        content: note.content,
        room: note.room,
        user: note.user,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the note and verify ownership
    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found or you do not have permission to update it' });
    }

    // Update the note
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { 
        title: title !== undefined ? title : note.title, 
        content: content !== undefined ? content : note.content 
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Note updated successfully',
      note: {
        _id: updatedNote!._id,
        title: updatedNote!.title,
        content: updatedNote!.content,
        room: updatedNote!.room,
        user: updatedNote!.user,
        createdAt: updatedNote!.createdAt,
        updatedAt: updatedNote!.updatedAt
      }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the note and verify ownership
    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found or you do not have permission to delete it' });
    }

    // Delete the note
    await Note.findByIdAndDelete(noteId);

    res.json({
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
