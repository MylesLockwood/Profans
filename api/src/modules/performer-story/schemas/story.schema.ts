import { Schema } from 'mongoose';

export const StorySchema = new Schema({
  type: { type: String, index: true },
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
  backgroundUrl: {
    type: String
  },
  title: { type: String },
  text: { type: String },
  textColor: { type: String },
  textStyle: {
    type: Schema.Types.Mixed
  },
  fileIds: [{
    type: Schema.Types.ObjectId,
    _id: false
  }],
  totalLike: { type: Number, default: 0 },
  totalComment: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
