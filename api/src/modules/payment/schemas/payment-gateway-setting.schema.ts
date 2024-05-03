import { Schema } from 'mongoose';

export const PaymentGatewaySettingSchema = new Schema({
  sourceId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  source: {
    type: String,
    index: true
  },
  key: {
    type: String
  },
  value: Schema.Types.Mixed,
  status: {
    type: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
