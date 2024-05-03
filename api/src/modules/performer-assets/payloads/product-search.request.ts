import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class ProductSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  performerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  excludedId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  fromDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  toDate: string;

  @ApiProperty()
  @IsOptional()
  includedIds: string[] | ObjectId[];
}
