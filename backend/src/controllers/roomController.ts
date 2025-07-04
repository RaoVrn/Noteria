import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { Note } from '../models/Note';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, parentRoom } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let path: string[] = [];
    
    // If this is a subroom, validate parent and build path
    if (parentRoom) {
      const parent = await Room.findOne({ _id: parentRoom, user: userId });
      if (!parent) {
        return res.status(404).json({ error: 'Parent room not found or you do not have permission' });
      }
      
      // Build path: parent's path + parent's id
      path = [...(parent.path || []), parent._id];
    }

    // Create new room
    const room = new Room({
      name,
      user: userId,
      parentRoom: parentRoom || null,
      path: path.length > 0 ? path : undefined
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        _id: room._id,
        name: room.name,
        user: room.user,
        parentRoom: room.parentRoom,
        path: room.path,
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
        parentRoom: room.parentRoom,
        path: room.path,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRootRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get only root-level rooms (no parent)
    const rooms = await Room.find({ 
      user: userId, 
      $or: [
        { parentRoom: null },
        { parentRoom: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      message: 'Root rooms retrieved successfully',
      rooms: rooms.map(room => ({
        _id: room._id,
        name: room.name,
        user: room.user,
        parentRoom: room.parentRoom,
        path: room.path,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get root rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoomsByParent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { parentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify parent room exists and user has access
    const parentRoom = await Room.findOne({ _id: parentId, user: userId });
    if (!parentRoom) {
      return res.status(404).json({ error: 'Parent room not found or you do not have permission' });
    }

    // Get subrooms for this parent
    const rooms = await Room.find({ 
      user: userId, 
      parentRoom: parentId 
    }).sort({ createdAt: -1 });

    res.json({
      message: 'Subrooms retrieved successfully',
      rooms: rooms.map(room => ({
        _id: room._id,
        name: room.name,
        user: room.user,
        parentRoom: room.parentRoom,
        path: room.path,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get rooms by parent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoomById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the room and verify ownership
    const room = await Room.findOne({ _id: roomId, user: userId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found or you do not have permission' });
    }

    res.json({
      message: 'Room retrieved successfully',
      room: {
        _id: room._id,
        name: room.name,
        user: room.user,
        parentRoom: room.parentRoom,
        path: room.path,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }
    });
  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the room and verify ownership
    const room = await Room.findOne({ _id: roomId, user: userId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found or you do not have permission to update it' });
    }

    // Update the room
    room.name = name;
    await room.save();

    res.json({
      message: 'Room updated successfully',
      room: {
        _id: room._id,
        name: room.name,
        user: room.user,
        parentRoom: room.parentRoom,
        path: room.path,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }
    });
  } catch (error) {
    console.error('Update room error:', error);
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

    // Delete all subrooms recursively
    await deleteRoomRecursively(roomId, userId);

    res.json({
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to recursively delete rooms and their contents
async function deleteRoomRecursively(roomId: string, userId: string) {
  // Find all subrooms
  const subrooms = await Room.find({ parentRoom: roomId, user: userId });
  
  // Recursively delete subrooms
  for (const subroom of subrooms) {
    await deleteRoomRecursively(subroom._id, userId);
  }
  
  // Delete all notes in this room
  await Note.deleteMany({ room: roomId, user: userId });
  
  // Delete the room itself
  await Room.findByIdAndDelete(roomId);
}
