import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class BlogModel extends Document {
  fromRef: string;

  refId: ObjectId | string;

  fromSourceId: ObjectId | string;

  fromSource: string;

  title: string;

  text: string;

  fileIds: Array<string | ObjectId>;

  totalLike: number;

  totalComment: number;

  createdAt: Date;

  updatedAt: Date;
}
