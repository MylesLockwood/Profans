import {
  IsIn, IsNotEmpty, IsOptional, IsString
} from 'class-validator';
import { PAYMENT_TYPE } from '../constants';

export class PurchaseStreamPayload {
  @IsOptional()
  @IsString()
  couponCode: string;

  @IsNotEmpty()
  @IsString()
  streamId: string;

  @IsNotEmpty()
  @IsIn([PAYMENT_TYPE.PUBLIC_CHAT, PAYMENT_TYPE.PRIVATE_CHAT])
  @IsString()
  type: string;
}
