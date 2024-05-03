import { ObjectId } from 'mongodb';
import {
  IsOptional, IsArray, IsNotEmpty
} from 'class-validator';

export class PerformerBlockCountriesPayload {
  @IsArray()
  @IsNotEmpty()
  countryCodes: string[];

  @IsArray()
  @IsOptional()
  performerId: string | ObjectId;
}
