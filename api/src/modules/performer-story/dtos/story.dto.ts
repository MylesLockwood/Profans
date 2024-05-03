import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { IPerformerResponse } from 'src/modules/performer/dtos';

export class StoryDto {
  _id: ObjectId | string;

  type: string;

  fromRef: string;

  refId: ObjectId | string;

  fromSourceId: ObjectId | string;

  fromSource: string;

  title: string;

  text: string;

  textColor: string;

  textStyle: any;

  fileIds: Array<string | ObjectId>;

  totalLike: number;

  totalComment: number;

  createdAt: Date;

  updatedAt: Date;

  isLiked?: boolean;

  performer?: IPerformerResponse;

  files?: any;

  backgroundUrl?: string;

  constructor(data?: Partial<StoryDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'type',
        'fromRef',
        'refId',
        'fromSourceId',
        'fromSource',
        'title',
        'text',
        'textColor',
        'textStyle',
        'fileIds',
        'totalLike',
        'totalComment',
        'createdAt',
        'updatedAt',
        'isLiked',
        'performer',
        'files',
        'backgroundUrl'
      ])
    );
  }
}
