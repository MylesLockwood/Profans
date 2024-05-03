import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class SearchDto {
  _id: ObjectId;

  keyword: string;

  objectType: string;

  attempt: number;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<SearchDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'keyword',
        'objectType',
        'attempt',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
