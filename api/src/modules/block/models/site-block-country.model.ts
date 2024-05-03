import { Document } from 'mongoose';

export class SiteBlockCountryModel extends Document {
  countryCode: string;

  createdAt: Date;
}
