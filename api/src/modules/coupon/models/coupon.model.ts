import { Document } from 'mongoose';

export class CouponModel extends Document {
  name: string;

  description: string;

  code: string;

  value: number;

  expiredDate: string | Date;

  status: string;

  numberOfUses: number;

  createdAt: Date;

  updatedAt: Date;
}
