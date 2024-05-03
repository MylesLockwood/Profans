import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';

export class ReferralReportSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  registerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  referralId: string;

  @ApiProperty()
  @IsOptional()
  fromDate: Date;

  @ApiProperty()
  @IsOptional()
  toDate: Date;
}
