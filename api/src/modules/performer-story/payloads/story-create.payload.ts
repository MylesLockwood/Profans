import {
  IsString, IsOptional
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StoryCreatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  type = 'text'

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  text: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  textColor: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  backgroundUrl: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  fileIds: string;
}
