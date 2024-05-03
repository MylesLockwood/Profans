import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class ReferralReportDto {
  _id: ObjectId;

  registerSource: string;

  registerId: ObjectId;

  registerInfo?: any;

  referralSource: string;

  referralId: ObjectId;

  referralInfo?: any;

  commission: number;

  ipAddress: string;

  ipInformation: any;

  userAgent: string;

  metaData: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<ReferralReportDto>) {
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
        'commission',
        'ipAddress',
        'ipInformation',
        'userAgent',
        'metaData',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
