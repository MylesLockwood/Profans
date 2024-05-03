import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class ReferralEarningDto {
  _id: ObjectId;

  registerSource: string;

  registerId: ObjectId;

  registerInfo?: any;

  referralSource: string;

  referralId: ObjectId;

  referralInfo?: any;

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

  constructor(data?: Partial<ReferralEarningDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'registerSource',
        'registerId',
        'registerInfo',
        'referralSource',
        'referralId',
        'referralInfo',
        'earningId',
        'sourceType',
        'grossPrice',
        'netPrice',
        'referralCommission',
        'isPaid',
        'paidAt',
        'createdAt',
        'updatedAt',
        'isToken'
      ])
    );
  }
}

export interface IReferralEarningStatResponse {
  totalReferralGrossPrice: number;
  totalReferralNetPrice: number;
  totalReferralCommission: number;
  totalRemaining: number;
}
