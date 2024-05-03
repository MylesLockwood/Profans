import {
  IsNotEmpty, IsNumber, IsString
} from 'class-validator';

export class SendTipPayload {
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  performerId: string;
}
