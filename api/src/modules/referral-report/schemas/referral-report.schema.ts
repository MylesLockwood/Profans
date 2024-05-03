import * as mongoose from 'mongoose';

export const ReferralReportSchema = new mongoose.Schema({
  registerSource: {
    type: String,
    index: true,
    default: 'user'
  },
  registerId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  referralSource: {
    type: String,
    index: true,
    default: 'user'
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  commission: {
    type: Number,
    default: 0.05
  },
  ipAddress: {
    type: String,
    index: true
  },
  ipInformation: {
    type: mongoose.Schema.Types.Mixed
  },
  userAgent: {
    type: mongoose.Schema.Types.Mixed
  },
  metaData: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'referralReport'
});
