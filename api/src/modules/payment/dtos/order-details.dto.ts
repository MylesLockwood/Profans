import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class OrderDetailsDto {
  _id: ObjectId;

  orderId: ObjectId;

  orderNumber: string;

  buyerId: ObjectId;

  buyerSource: string;

  sellerId: ObjectId;

  sellerSource: string;

  productType: string;

  productId: ObjectId;

  productInfo?: any;

  productSessionId: string;

  name: string;

  description: string;

  unitPrice: number;

  originalPrice: number;

  status: string;

  payBy: string;

  quantity: number;

  totalPrice: number;

  shippingCode: string;

  deliveryStatus?: string;

  deliveryAddress?: string;

  paymentStatus?: string;

  postalCode?: string;

  couponInfo?: any;

  extraInfo?: any

  seller?: any;

  buyer?: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<OrderDetailsDto>) {
    data
    && Object.assign(
      this,
      pick(data, [
        '_id',
        'orderId',
        'orderNumber',
        'buyerId',
        'buyerSource',
        'sellerId',
        'sellerSource',
        'productType',
        'productId',
        'productSessionId',
        'productInfo',
        'name',
        'description',
        'unitPrice',
        'originalPrice',
        'status',
        'payBy',
        'quantity',
        'totalPrice',
        'deliveryStatus',
        'deliveryAddress',
        'shippingCode',
        'paymentStatus',
        'postalCode',
        'couponInfo',
        'extraInfo',
        'seller',
        'buyer',
        'createdAt',
        'updatedAt'
      ])
    );
  }

  toResponse(isAdmin = false) {
    const publicInfo = {
      _id: this._id,
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      buyerId: this.buyerId,
      buyerSource: this.buyerSource,
      sellerId: this.sellerId,
      sellerSource: this.sellerSource,
      productType: this.productType,
      productId: this.productId,
      productSessionId: this.productSessionId,
      productInfo: this.productInfo,
      name: this.name,
      description: this.description,
      unitPrice: this.unitPrice,
      originalPrice: this.originalPrice,
      status: this.status,
      payBy: this.payBy,
      quantity: this.quantity,
      totalPrice: this.totalPrice,
      deliveryStatus: this.deliveryStatus,
      deliveryAddress: this.deliveryAddress,
      shippingCode: this.shippingCode,
      paymentStatus: this.paymentStatus,
      postalCode: this.postalCode,
      couponInfo: this.couponInfo,
      seller: this.seller,
      buyer: this.buyer,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
    const privateInfo = {
      extraInfo: this.extraInfo
    };
    if (!isAdmin) {
      return publicInfo;
    }
    return { ...publicInfo, ...privateInfo };
  }
}
