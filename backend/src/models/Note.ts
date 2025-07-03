import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IRoom } from './Room';

export interface INote extends Document {
  title: string;
  content: string;
  room: IRoom['_id'];
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Note title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Note content is required']
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    }
  },
  {
    timestamps: true
  }
);

export const Note = mongoose.model<INote>('Note', NoteSchema);
