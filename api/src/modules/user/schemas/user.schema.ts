import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { STATUS_ACTIVE, ROLE_USER } from '../constants';

export const userSchema = new mongoose.Schema({
  name: String,
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
  verifiedEmail: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String
  },
  roles: [
    {
      type: String,
      default: ROLE_USER
    }
  ],
  avatarId: ObjectId,
  avatarPath: String,
  status: {
    type: String,
    default: STATUS_ACTIVE
  },
  gender: {
    type: String,
    index: true
  },
  referralCommission: {
    type: Number,
    default: 0.05
  },
  balance: {
    type: Number,
    default: 0
  },
  country: {
    type: String
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
  stats: {
    totalViewTime: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  twitterProfile: {
    type: mongoose.Schema.Types.Mixed
  },
  googleProfile: {
    type: mongoose.Schema.Types.Mixed
  },
  googleConnected: {
    type: Boolean,
    default: false
  },
  twitterConnected: {
    type: Boolean,
    default: false
  },
  authorisedCard: {
    type: Boolean,
    default: false
  },
  ccbillCardToken: {
    type: String
  }
});

// userSchema.pre<any>('save', function(next) {
//   next();
// });

export const UserSchema = userSchema;
