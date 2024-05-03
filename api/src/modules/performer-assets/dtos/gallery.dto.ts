import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { GalleryModel } from '../models';

export class GalleryDto {
  _id?: ObjectId;

  performerId?: ObjectId;

  type?: string;

  name?: string;

  description?: string;

  status?: string;

  processing?: boolean;

  coverPhotoId?: ObjectId;

  price?: number;

  coverPhoto?: Record<string, any>;

  performer?: any;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  tagline?: string;

  isBookMarked?: boolean;

  constructor(init?: Partial<GalleryDto>) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'performerId',
        'type',
        'name',
        'description',
        'status',
        'coverPhotoId',
        'price',
        'coverPhoto',
        'performer',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt',
        'tagline',
        'isBookMarked'
      ])
    );
  }

  static fromModel(model: GalleryModel) {
    return new GalleryDto(model);
  }
}
