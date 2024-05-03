import * as mongoose from 'mongoose';

const performerTrendingSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true
  },
  firstName: String,
  lastName: String,
  username: {
    type: String,
    index: true
  },
  dateOfBirth: {
    type: Date
  },
  avatarId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  avatarPath: String,
  coverId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  coverPath: String,
  welcomeVideoId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  welcomeVideoPath: {
    type: String
  },
  activateWelcomeVideo: {
    type: Boolean,
    default: false
  },
  verifiedAccount: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    index: true
  },
  country: {
    type: String,
    index: true
  },
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  totalSubscribersInDay: {
    type: Number,
    default: 0
  },
  performerId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  listType: {
    type: String,
    index: true
  },
  isProtected: {
    type: Boolean,
    default: false
  },
  ordering: {
    type: Number,
    default: 0
  }
});

export const PerformerTrendingSchema = performerTrendingSchema;
