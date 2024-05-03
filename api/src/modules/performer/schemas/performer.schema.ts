import * as mongoose from 'mongoose';
import {
  GROUP_CHAT, OFFLINE, PRIVATE_CHAT, PUBLIC_CHAT
} from 'src/modules/stream/constant';

const performerSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true
  },
  firstName: String,
  lastName: String,
  username: {
    type: String,
    index: true,
    unique: true,
    trim: true,
    // uniq if not null
    sparse: true
  },
  email: {
    type: String,
    index: true,
    unique: true,
    lowercase: true,
    trim: true,
    // uniq if not null
    sparse: true
  },
  status: {
    type: String,
    index: true
  },
  dateOfBirth: {
    type: Date
  },
  bodyType: {
    type: String,
    index: true
  },
  phone: {
    type: String
  },
  phoneCode: String, // international code prefix
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
  idVerificationId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  documentVerificationId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
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
  verifiedEmail: {
    type: Boolean,
    default: false
  },
  verifiedAccount: {
    type: Boolean,
    default: false
  },
  verifiedDocument: {
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
  city: String,
  state: String,
  zipcode: String,
  address: String,
  languages: [
    {
      type: String
    }
  ],
  categoryIds: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ],
  schedule: {
    type: mongoose.Schema.Types.Mixed
  },
  timezone: String,
  noteForUser: String,
  height: {
    type: String,
    index: true
  },
  weight: {
    type: String,
    index: true
  },
  bio: String,
  eyes: {
    type: String,
    index: true
  },
  hair: {
    type: String,
    index: true
  },
  pubicHair: {
    type: String,
    index: true
  },
  butt: {
    type: String,
    index: true
  },
  ethnicity: {
    type: String,
    index: true
  },
  sexualOrientation: {
    type: String,
    index: true
  },
  isFreeSubscription: {
    type: Boolean,
    default: true
  },
  monthlyPrice: {
    type: Number,
    default: 1
  },
  yearlyPrice: {
    type: Number,
    default: 1
  },
  publicChatPrice: {
    type: Number,
    default: 1
  },
  privateChatPrice: {
    type: Number,
    default: 1
  },
  stats: {
    likes: {
      type: Number,
      default: 0
    },
    subscribers: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    totalVideos: {
      type: Number,
      default: 0
    },
    totalPhotos: {
      type: Number,
      default: 0
    },
    totalGalleries: {
      type: Number,
      default: 0
    },
    totalProducts: {
      type: Number,
      default: 0
    },
    totalFeeds: {
      type: Number,
      default: 0
    },
    totalBlogs: {
      type: Number,
      default: 0
    },
    totalStories: {
      type: Number,
      default: 0
    },
    totalStreamTime: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  score: {
    type: Number,
    default: 0,
    index: true
  },
  isOnline: {
    type: Number,
    default: 0
  },
  onlineAt: {
    type: Date
  },
  offlineAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastStreamingTime: Date,
  maxParticipantsAllowed: {
    type: Number,
    default: 1
  },
  live: {
    type: Boolean,
    index: true,
    default: false
  },
  streamingStatus: {
    type: String,
    enum: [PUBLIC_CHAT, PRIVATE_CHAT, GROUP_CHAT, OFFLINE],
    default: OFFLINE,
    index: true
  },
  twitterProfile: {
    type: mongoose.Schema.Types.Mixed
  },
  twitterConnected: {
    type: Boolean,
    default: false
  },
  googleProfile: {
    type: mongoose.Schema.Types.Mixed
  },
  googleConnected: {
    type: Boolean,
    default: false
  }
});

performerSchema.pre<any>('updateOne', async function preUpdateOne(next) {
  const model = await this.model.findOne(this.getQuery());
  const { stats } = model;
  if (!stats) {
    return next();
  }
  const score = (stats.subscribers || 0) * 3 + (stats.likes || 0) * 2 + (stats.views || 0);
  model.score = score || 0;
  await model.save();
  return next();
});

export const PerformerSchema = performerSchema;
