import * as mongoose from 'mongoose';

export const CommentSchema = new mongoose.Schema({
  content: String,
  objectType: {
    type: String,
    default: 'video',
    index: true
  },
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  totalReply: {
    type: Number,
    default: 0
  },
  totalLike: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
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
