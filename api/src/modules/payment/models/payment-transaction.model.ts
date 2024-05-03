import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PaymentProductModel {
  name?: string;

  description?: string;

  price?: number | string;

  productType?: string;

  productId?: ObjectId;

  quantity?: number;
}

export class PaymentTransactionModel extends Document {
  paymentGateway: string;

  orderId: ObjectId;

  source: string;

  sourceId: ObjectId;

  // subscription, store, etc...
  type: string;

  totalPrice: number;

  products: PaymentProductModel[];

  paymentResponseInfo?: any;

  status: string;

  createdAt?: Date;

  updatedAt?: Date;
}
