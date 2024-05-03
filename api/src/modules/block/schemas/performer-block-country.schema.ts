import { Schema } from 'mongoose';

export const PerformerBlockCountrySchema = new Schema({
  source: {
    type: String,
    index: true
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  countryCodes: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PerformerBlockCountrySchema.index({ countries: 1 });
