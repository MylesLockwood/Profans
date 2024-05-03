import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PerformerBlockCountryModel extends Document {
  source: string;

  sourceId: ObjectId | string;

  countryCodes: string[];

  createdAt: Date;

  updatedAt: Date;
}
