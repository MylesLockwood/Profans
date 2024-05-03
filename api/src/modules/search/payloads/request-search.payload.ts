import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';

export class SearchRequestPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  objectType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fromPerformerId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dateRange: string;
}
