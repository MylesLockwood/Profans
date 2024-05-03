import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class BlogSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  q: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  performerId: string;

  ids?: string[] | ObjectId[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  fromDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  toDate: Date;
}
