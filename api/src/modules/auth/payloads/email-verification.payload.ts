import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EmailVerificationPayload {
  @ApiProperty()
  @IsNotEmpty()
  source: any;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sourceType: string;
}
