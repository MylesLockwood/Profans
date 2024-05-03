import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class VideoSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  performerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  excludedId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty()
  @IsOptional()
  isSaleVideo: boolean;

  ids?: string[] | ObjectId[];
}
