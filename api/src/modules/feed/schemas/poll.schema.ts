import { Schema } from 'mongoose';

export const PollSchema = new Schema({
  fromRef: {
    type: String
  },
  refId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  description: {
    type: String
  },
  totalVote: { type: Number, default: 0 },
  expiredAt: {
    type: Date, default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
