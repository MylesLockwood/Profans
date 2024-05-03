import * as mongoose from 'mongoose';
import { SUBSCRIPTION_STATUS, SUBSCRIPTION_TYPE } from '../constants';

const subscriptionSchema = new mongoose.Schema({
  subscriptionType: {
    type: String,
    default: SUBSCRIPTION_TYPE.MONTHLY,
    index: true,
    enum: [
      SUBSCRIPTION_TYPE.FREE,
      SUBSCRIPTION_TYPE.MONTHLY,
      SUBSCRIPTION_TYPE.YEARLY,
      SUBSCRIPTION_TYPE.SYSTEM
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  performerId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  subscriptionId: {
    type: String,
    index: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  paymentGateway: {
    type: String,
    default: 'ccbill',
    index: true
  },
  startRecurringDate: {
    type: Date,
    default: Date.now
  },
  nextRecurringDate: {
    type: Date
  },
  status: {
    type: String,
    default: SUBSCRIPTION_STATUS.ACTIVE,
    index: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  },
  expiredAt: {
    type: Date,
    default: Date.now
  },
  blockedUser: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
subscriptionSchema.pre<any>('save', function preSave(next) {
  this.updatedAt = new Date();
  next();
});
subscriptionSchema.pre<any>('updateOne', function preUpdateOne(next) {
  this.updatedAt = new Date();
  next();
});

export const SubscriptionSchema = subscriptionSchema;
