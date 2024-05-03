import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class CommentDto {
  _id: ObjectId;

  objectId?: ObjectId;

  content?: string;

  createdBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  creator?: any;

  objectType?: string;

  isLiked?: boolean;

  totalReply?: number;

  totalLike?: number;

  constructor(data?: Partial<CommentDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'objectId',
        'content',
        'createdBy',
        'createdAt',
        'updatedAt',
        'creator',
        'objectType',
        'isLiked',
        'totalReply',
        'totalLike'
      ])
    );
  }
}
