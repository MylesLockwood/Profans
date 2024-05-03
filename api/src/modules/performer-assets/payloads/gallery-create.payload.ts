import {
  IsString,
  IsOptional,
  IsIn,
  IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GalleryCreatePayload {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tagline: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status: string;

  @ApiProperty()
  @IsOptional()
  price: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  performerId: string;
}
