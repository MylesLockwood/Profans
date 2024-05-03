import { Schema } from 'mongoose';

export const VoteSchema = new Schema({
  fromSourceId: {
    type: Schema.Types.ObjectId, // feedId
    index: true
  },
  fromSource: {
    type: String, // feed
    index: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  targetSource: {
    type: String,
    index: true
  },
  refId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
