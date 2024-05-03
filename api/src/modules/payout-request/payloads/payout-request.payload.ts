import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsIn,
  IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchRequest } from 'src/kernel/common';
import { ObjectId } from 'mongodb';
import { STATUSES, SOURCE_TYPE } from '../constants';

export class PayoutRequestCreatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn([SOURCE_TYPE.PERFORMER, SOURCE_TYPE.USER])
  source: string;

  @ApiProperty()
  @IsOptional()
  fromDate: Date;

  @ApiProperty()
  @IsOptional()
  toDate: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  requestNote: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentAccountType?: string;
}

export class PayoutRequestPerformerUpdatePayload {
  @ApiProperty()
  @IsOptional()
  fromDate: Date;

  @ApiProperty()
  @IsOptional()
  toDate: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  requestNote: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  requestPrice: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentAccountType?: string;
}

export class PayoutRequestUpdatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn([STATUSES.PENDING, STATUSES.REJECTED, STATUSES.DONE, STATUSES.APPROVED])
  status: string;

  @ApiProperty()
  @IsOptional()
  fromDate: Date;

  @ApiProperty()
  @IsOptional()
  toDate: Date;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  requestPrice: number;

  @ApiProperty()
  @IsOptional()
  adminNote: string;
}

export class PayoutRequestSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
  sourceId: string | ObjectId;

  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentAccountType?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  fromDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  toDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  source: string;
}
