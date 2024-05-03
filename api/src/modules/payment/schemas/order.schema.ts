import { Schema } from 'mongoose';

export const OrderSchema = new Schema({
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
  type: {
    type: String
  },
  orderNumber: {
    type: String
  },
  status: {
    type: String,
    index: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  totalPrice: {
    type: Number,
    default: 1
  },
  originalPrice: {
    type: Number
  },
  couponInfo: {
    type: Schema.Types.Mixed
  },
  deliveryAddress: {
    type: String
  },
  postalCode: {
    type: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
