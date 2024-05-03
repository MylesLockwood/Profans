import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';
import { SOURCE_TYPE } from '../constants';

export const payoutRequestSchema = new Schema({
  source: {
    index: true,
    type: String,
    enum: [SOURCE_TYPE.PERFORMER, SOURCE_TYPE.USER],
    default: SOURCE_TYPE.USER
  },
  sourceId: {
    index: true,
    type: ObjectId
  },
  paymentAccountType: {
    type: String,
    index: true
  },
  paymentAccountInfo: {
    type: Schema.Types.Mixed
  },
  requestPrice: {
    type: Number,
    default: 0
  },
  requestNote: {
    type: String
  },
  adminNote: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'done'],
    default: 'pending',
    index: true
  },
  fromDate: {
    type: Date
  },
  toDate: {
    type: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
