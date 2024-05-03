import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class PayoutRequestDto {
  _id: any;

  source: string;

  sourceId: ObjectId;

  sourceInfo: any;

  paymentAccountInfo?: any;

  paymentAccountType: string;

  requestNote: string;

  requestPrice?: number;

  adminNote?: string;

  status: string;

  createdAt: Date;

  updatedAt: Date;

  fromDate: Date;

  toDate: Date;

  constructor(data?: Partial<PayoutRequestDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'source',
        'sourceId',
        'sourceInfo',
        'paymentAccountType',
        'paymentAccountInfo',
        'requestNote',
        'requestPrice',
        'adminNote',
        'status',
        'createdAt',
        'updatedAt',
        'fromDate',
        'toDate'
      ])
    );
  }
}
