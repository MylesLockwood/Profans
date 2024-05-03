import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class ReferralEarningModel extends Document {
  registerSource: string;

  registerId: ObjectId;

  referralSource: string;

  referralId: ObjectId;

  earningId: ObjectId;

  // video, subscription, ...
  sourceType: string;

  grossPrice: number;

  netPrice: number;

  referralCommission: number;

  isPaid: boolean;

  paidAt: Date;

  createdAt: Date;

  updatedAt: Date;

  isToken: boolean;
}
