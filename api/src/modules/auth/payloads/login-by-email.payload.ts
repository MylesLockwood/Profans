import {
  IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginByEmailPayload {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  remember: boolean;
}
