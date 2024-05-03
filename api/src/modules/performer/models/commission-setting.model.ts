import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class CommissionSettingModel extends Document {
  performerId: ObjectId;

  monthlySubscriptionCommission: number;

  yearlySubscriptionCommission: number;

  videoSaleCommission: number;

  productSaleCommission: number;

  feedSaleCommission: number;

  tipCommission: number;

  publicChatCommission: number;

  privateChatCommission: number;

  referralCommission: number;

  createdAt: Date;

  updatedAt: Date;
}
