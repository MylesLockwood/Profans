import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPricePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  streamId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  price: number;
}
