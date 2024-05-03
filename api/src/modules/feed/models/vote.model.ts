import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class VoteModel extends Document {
  fromSourceId?: string | ObjectId;

  fromSource?: string;

  targetId?: string | ObjectId;

  targetSource?: string;

  refId?: string | ObjectId;

  createdAt?: Date;

  updatedAt?: Date;
}
