import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class UserModel extends Document {
  name: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  roles?: string[];

  avatarId?: ObjectId;

  avatarPath?: string;

  status: string;

  balance: number;

  username: string;

  country: string;

  gender: string;

  referralCommission: number;

  isOnline?: boolean;

  onlineAt?: Date;

  offlineDat?: Date;

  createdAt: Date;

  updatedAt: Date;

  verifiedEmail?: boolean;

  twitterProfile?: any;

  twitterConnected?: boolean;

  googleProfile?: any;

  googleConnected?: boolean;

  authorisedCard?: boolean;

  ccbillCardToken?: string;

  stats: {
    totalViewTime: number;
  }
}
