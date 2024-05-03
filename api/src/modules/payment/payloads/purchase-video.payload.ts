import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class PurchaseVideoPayload {
  @IsOptional()
  @IsString()
  couponCode: string;

  @IsNotEmpty()
  @IsString()
  videoId: string;
}
