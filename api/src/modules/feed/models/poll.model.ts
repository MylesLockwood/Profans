import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PollModel extends Document {
  description: string;

  createdBy: ObjectId;

  fromRef: string;

  refId: ObjectId;

  totalVote?: number;

  expiredAt: Date;

  createdAt: Date;

  updatedAt: Date;
}
