import {
  IsString, IsNotEmpty, IsBoolean, IsOptional
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginByUsernamePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  remember: boolean;
}
