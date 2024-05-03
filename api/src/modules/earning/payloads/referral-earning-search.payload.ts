import { SearchRequest } from 'src/kernel/common';
import { ObjectId } from 'mongodb';

export class ReferralEarningSearchRequestPayload extends SearchRequest {
  registerId?: string | ObjectId;

  referralId?: string | ObjectId;

  sourceType?: string;

  isPaid?: any;

  fromDate?: Date;

  toDate?: Date;
}
