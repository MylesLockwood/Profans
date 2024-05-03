import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class OrderDto {
  _id: ObjectId;

  buyerId: ObjectId;

  buyerSource: string;

  sellerId: ObjectId;

  sellerSource: string;

  type: string;

  details: any[];

  status: string;

  quantity: number;

  totalPrice: number;

  originalPrice: number;

  deliveryAddress?: string;

  postalCode?: string;

  couponInfo: any;

  seller: any;

  buyer: any;

  orderNumber: string;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<OrderDto>) {
    data
      && Object.assign(
        this,
        pick(data, [
          '_id',
          'buyerId',
          'buyerSource',
          'sellerId',
          'sellerSource',
          'type',
          'quantity',
          'totalPrice',
          'originalPrice',
          'deliveryAddress',
          'postalCode',
          'couponInfo',
          'buyer',
          'seller',
          'status',
          'details',
          'orderNumber',
          'createdAt',
          'updatedAt'
        ])
      );
  }
}
