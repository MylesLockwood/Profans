import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class StreamModel extends Document {
  performerId?: ObjectId;

  userIds?: ObjectId[];

  streamIds?: string[];

  type?: string;

  sessionId?: string;

  isStreaming?: boolean;

  totalViewer?: number;

  streamingTime?: number;

  lastStreamingTime?: Date;

  price?: number

  createdAt?: Date;

  updatedAt?: Date;
}
