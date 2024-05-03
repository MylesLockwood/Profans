import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConversationUpdatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string
}
