import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class FeedModel extends Document {
  _id: ObjectId;

  type: string;

  fromSourceId: ObjectId | string;

  fromSource: string;

  title: string;

  text: string;

  fileIds: Array<string | ObjectId>;

  pollIds: Array<string | ObjectId>;

  totalLike: number;

  totalComment: number;

  isSale: boolean;

  price: number;

  orientation: string;

  teaserId: ObjectId;

  thumbnailId: ObjectId;

  tagline: string;

  isPinned: boolean;

  status: string;

  pinnedAt: Date;

  createdAt: Date;

  updatedAt: Date;
}
