import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class PerformerBlockUserDto {
  _id: ObjectId;

  source: string

  sourceId: ObjectId;

  target: string;

  targetId: ObjectId;

  reason: string;

  targetInfo?: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<PerformerBlockUserDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'source',
        'sourceId',
        'reason',
        'target',
        'targetId',
        'targetInfo',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
