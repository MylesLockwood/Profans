import * as mongoose from 'mongoose';

export const ReferralEarningSchema = new mongoose.Schema({
  registerSource: {
    type: String,
    index: true
  },
  registerId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  referralSource: {
    type: String,
    index: true
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  earningId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  // from details of item
  sourceType: {
    type: String,
    index: true
  },
  grossPrice: {
    type: Number,
    default: 0
  },
  netPrice: {
    type: Number,
    default: 0
  },
  referralCommission: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isToken: {
    type: Boolean,
    default: false
  }
}, {
  collection: 'referralEarnings'
});
