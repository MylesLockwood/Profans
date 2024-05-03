import {
  IsString,
  IsOptional,
  IsNotEmpty, IsIn, IsDateString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { POLL_TARGET_SOURCE } from '../constants';

export class PollCreatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  expiredAt: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  performerId: string;
}

export class VoteCreatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn([POLL_TARGET_SOURCE.FEED])
  targetSource = 'feed';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId: string;
}
