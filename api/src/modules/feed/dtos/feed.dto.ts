import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { IPerformerResponse } from 'src/modules/performer/dtos';

export class FeedDto {
  _id: ObjectId | string;

  type: string;

  fromSourceId: ObjectId | string;

  fromSource: string;

  title: string;

  text: string;

  fileIds: Array<string | ObjectId>;

  pollIds: Array<string | ObjectId>;

  pollExpiredAt: Date;

  totalLike: number;

  totalComment: number;

  createdAt: Date;

  updatedAt: Date;

  isLiked: boolean;

  isSubscribed: boolean;

  isBought: boolean;

  performer: IPerformerResponse;

  files: any;

  polls: any;

  isSale: boolean;

  price: number;

  isBookMarked: boolean;

  orientation: string;

  teaserId: ObjectId;

  teaser: any;

  thumbnailId: ObjectId;

  thumbnailUrl: string;

  tagline: string;

  isPinned: boolean;

  pinnedAt: Date;

  status: string;

  constructor(data: Partial<FeedDto>) {
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
        'fileIds',
        'pollIds',
        'totalLike',
        'totalComment',
        'createdAt',
        'updatedAt',
        'isLiked',
        'isBookMarked',
        'performer',
        'files',
        'polls',
        'isSale',
        'price',
        'isSubscribed',
        'isBought',
        'pollExpiredAt',
        'orientation',
        'teaserId',
        'teaser',
        'thumbnailId',
        'thumbnailUrl',
        'tagline',
        'isPinned',
        'pinnedAt',
        'status'
      ])
    );
  }
}
