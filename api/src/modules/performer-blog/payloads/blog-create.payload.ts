import {
  IsString, IsOptional, IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlogCreatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  fileIds: string;
}
