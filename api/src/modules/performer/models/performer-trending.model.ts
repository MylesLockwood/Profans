import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PerformerTrendingModel extends Document {
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
}
