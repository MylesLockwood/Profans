import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { MessageCreatePayload } from './message-create.payload';

export class PrivateMessageCreatePayload extends MessageCreatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  recipientId: ObjectId;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  recipientType: string;
}
