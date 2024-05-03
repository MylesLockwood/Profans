import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class ReactionDto {
  source?: string;

  action?: string;

  objectId?: ObjectId;

  objectInfo?: any;

  objectType?: string;

  createdBy?: string | ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  creator?: any;

  constructor(data?: Partial<ReactionDto>) {
    Object.assign(
      this,
      pick(data, [
        'source',
        'action',
        'objectId',
        'objectInfo',
        'objectType',
        'createdBy',
        'creator',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
