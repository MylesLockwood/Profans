import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class PurchaseFeedPayload {
  @IsOptional()
  @IsString()
  couponCode: string;

  @IsNotEmpty()
  @IsString()
  feedId: string;
}
