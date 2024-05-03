import {
  IsString, IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockCountryCreatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}
