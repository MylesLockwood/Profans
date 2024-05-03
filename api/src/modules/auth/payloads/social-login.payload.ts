import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AuthGooglePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tokenId: string;
}
