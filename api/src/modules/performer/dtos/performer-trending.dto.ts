import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { FileDto } from 'src/modules/file';

export class PerformerTrendingDto {
  _id?: ObjectId;

  name: string;

  firstName: string;

  lastName: string;

  username: string;

  dateOfBirth: Date;

  avatarId: ObjectId;

  avatarPath: string;

  coverId: ObjectId;

  coverPath: string;

  welcomeVideoId: ObjectId;

  welcomeVideoPath: string;

  activateWelcomeVideo: boolean;

  verifiedAccount: boolean;

  gender: string;

  country: string;

  bio: string;

  createdAt: Date;

  updatedAt: Date;

  totalSubscribersInDay: number;

  performerId: ObjectId;

  listType: string;

  isProtected: boolean;

  ordering: number;

  constructor(data: Partial<any>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'name',
        'firstName',
        'lastName',
        'name',
        'username',
        'avatarId',
        'avatarPath',
        'coverId',
        'coverPath',
        'gender',
        'country',
        'bio',
        'createdAt',
        'updatedAt',
        'welcomeVideoId',
        'welcomeVideoPath',
        'activateWelcomeVideo',
        'dateOfBirth',
        'performerId',
        'listType',
        'verifiedAccount',
        'totalSubscribersInDay',
        'isProtected',
        'ordering'
      ])
    );
  }

  toResponse() {
    return {
      _id: this._id,
      performerId: this.performerId,
      name: this.getName(),
      avatar: FileDto.getPublicUrl(this.avatarPath),
      cover: FileDto.getPublicUrl(this.coverPath),
      username: this.username,
      gender: this.gender,
      firstName: this.firstName,
      lastName: this.lastName,
      country: this.country,
      welcomeVideoPath: FileDto.getPublicUrl(this.welcomeVideoPath),
      activateWelcomeVideo: this.activateWelcomeVideo,
      verifiedAccount: this.verifiedAccount,
      dateOfBirth: this.dateOfBirth,
      totalSubscribersInDay: this.totalSubscribersInDay,
      ordering: this.ordering,
      isProtected: this.isProtected,
      bio: this.bio
    };
  }

  getName() {
    if (this.name) return this.name;
    return [this.firstName || '', this.lastName || ''].join(' ');
  }
}
