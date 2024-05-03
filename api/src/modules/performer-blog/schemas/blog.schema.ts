import { Schema } from 'mongoose';

export const BlogSchema = new Schema({
  fromRef: {
    type: String
  },
  refId: {
    type: Schema.Types.ObjectId
  },
  fromSourceId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  fromSource: {
    type: String,
    index: true
  },
  title: { type: String },
  text: { type: String },
  fileIds: [{
    type: Schema.Types.ObjectId,
    _id: false,
    index: true
  }],
  totalLike: { type: Number, default: 0 },
  totalComment: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
