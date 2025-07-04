import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IRoom extends Document {
  name: string;
  user: IUser['_id'];
  parentRoom?: IRoom['_id'];
  path?: IRoom['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [100, 'Room name cannot exceed 100 characters']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    parentRoom: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      default: null
    },
    path: [{
      type: Schema.Types.ObjectId,
      ref: 'Room'
    }]
  },
  {
    timestamps: true
  }
);

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
