import { Request, Response } from 'express';
import { Room } from '../models/Room';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Create new room
    const room = new Room({
      name,
      user: userId
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        _id: room._id,
        name: room.name,
        user: room.user,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all rooms for the authenticated user
    const rooms = await Room.find({ user: userId }).sort({ createdAt: -1 });

    res.json({
      message: 'Rooms retrieved successfully',
      rooms: rooms.map(room => ({
        _id: room._id,
        name: room.name,
        user: room.user,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the room and verify ownership
    const room = await Room.findOne({ _id: roomId, user: userId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found or you do not have permission to delete it' });
    }

    // Delete the room
    await Room.findByIdAndDelete(roomId);

    // TODO: Also delete all notes in this room
    // await Note.deleteMany({ room: roomId });

    res.json({
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
