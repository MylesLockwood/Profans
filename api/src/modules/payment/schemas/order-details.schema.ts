import { Schema } from 'mongoose';

export const OrderDetailsSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  orderNumber: {
    type: String
  },
  // buyer ID
  buyerId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  buyerSource: {
    // user, performer, etc...
    type: String
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  sellerSource: {
    // user, performer, etc...
    type: String
  },
  productType: {
    type: String
  },
  productId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  // stream session
  productSessionId: {
    type: String,
    index: true
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  unitPrice: {
    type: Number
  },
  quantity: {
    type: Number
  },
  originalPrice: {
    type: Number
  },
  totalPrice: {
    type: Number
  },
  status: {
    type: String,
    index: true
  },
  deliveryStatus: {
    type: String,
    index: true
  },
  deliveryAddress: {
    type: String
  },
  paymentStatus: {
    type: String,
    index: true
  },
  payBy: {
    type: String
  },
  couponInfo: {
    type: Schema.Types.Mixed
  },
  shippingCode: {
    type: String
  },
  extraInfo: {
    type: Schema.Types.Mixed
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
