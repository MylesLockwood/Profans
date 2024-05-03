import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class StoryModel extends Document {
  type: string;

  fromRef: string;

  refId: ObjectId | string;

  fromSourceId: ObjectId | string;

  fromSource: string;

  title: string;

  text: string;

  textColor: string;

  textStyle: any;

  backgroundUrl: string;

  fileIds: Array<string | ObjectId>;

  totalLike: number;

  totalComment: number;

  createdAt: Date;

  updatedAt: Date;
}
