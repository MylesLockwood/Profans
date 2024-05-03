import {
  IsString,
  IsOptional,
  IsIn
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhotoUpdatePayload {
  @ApiProperty()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['draft', 'active', 'inactive'])
  status: string;

  @ApiProperty()
  // @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  galleryId: string;
}
