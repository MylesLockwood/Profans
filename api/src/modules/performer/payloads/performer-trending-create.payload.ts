import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrendingProfileCreatePayload {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ordering?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  performerId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  listType?: string;
}
