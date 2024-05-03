import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class ReferralReportModel extends Document {
  registerSource: string;

  registerId: ObjectId;

  referralSource: string;

  referralId: ObjectId

  commission: number;

  ipAddress: string;

  ipInformation: any;

  userAgent: string;

  metaData: any;

  createdAt: Date;

  updatedAt: Date;
}
