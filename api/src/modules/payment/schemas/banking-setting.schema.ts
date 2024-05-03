import { Schema } from 'mongoose';

export const BankingSettingSchema = new Schema({
  source: {
    type: String,
    index: true
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  SSN: {
    type: String
  },
  bankName: {
    type: String
  },
  bankAccount: {
    type: String
  },
  bankRouting: {
    type: String
  },
  bankSwiftCode: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  country: {
    type: String
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
