import {
  IsString, IsOptional, IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchCreatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  objectType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fromPerformerId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  keyword: string;
}
