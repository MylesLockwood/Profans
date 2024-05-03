import {
  IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max
} from 'class-validator';

export class CommissionSettingPayload {
  @IsString()
  @IsNotEmpty()
  performerId: string;

  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  monthlySubscriptionCommission: number;

  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  yearlySubscriptionCommission: number;

  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  videoSaleCommission: number;

  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  productSaleCommission: number;

  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  tipCommission: number;

  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  feedSaleCommission: number;

  @IsNumber()
  @Min(0.01)
  @Max(0.99)
  @IsOptional()
  referralCommission: number;
}
