import * as mongoose from 'mongoose';
import { SEARCH_OBJECTS } from '../constants';

export const SearchSchema = new mongoose.Schema({
  keyword: {
    type: String,
    index: true
  },
  objectType: {
    type: String,
    default: SEARCH_OBJECTS.FEED,
    index: true
  },
  attempt: {
    type: Number,
    default: 1
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
