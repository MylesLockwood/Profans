import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { IPerformerResponse } from 'src/modules/performer/dtos';

export class BlogDto {
  _id: ObjectId | string;

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

  isLiked?: boolean;

  performer?: IPerformerResponse;

  files?: any;

  constructor(data?: Partial<BlogDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'fromRef',
        'refId',
        'fromSourceId',
        'fromSource',
        'title',
        'text',
        'fileIds',
        'totalLike',
        'totalComment',
        'createdAt',
        'updatedAt',
        'isLiked',
        'performer',
        'files'
      ])
    );
  }
}
