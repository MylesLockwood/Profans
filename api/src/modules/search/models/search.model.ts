import { Document } from 'mongoose';

export class SearchModel extends Document {
  keyword: string;

  objectType: string;

  attempt: number;

  createdAt: Date;

  updatedAt: Date;
}
