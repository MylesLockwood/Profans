import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const GallerySchema = new Schema({
  performerId: ObjectId,
  type: {
    type: String,
    index: true
  },
  name: {
    type: String
    // TODO - text index?
  },
  description: String,
  status: {
    type: String,
    // draft, active
    default: 'active'
  },
  price: {
    type: Number,
    default: 0
  },
  numOfItems: {
    type: Number,
    default: 0
  },
  coverPhotoId: ObjectId,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tagline: String
});
