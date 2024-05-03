import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional
} from 'class-validator';

export class CCBillPaymentGateway {
  @IsNotEmpty()
  subAccountNumber: string;

  @IsNotEmpty()
  flexformId: string;

  @IsOptional()
  salt?: string;
}

export class PaymentGatewaySettingPayload {
  @IsString()
  source: string;

  @IsString()
  sourceId: string;

  @IsString()
  key = 'ccbill';

  @IsString()
  status = 'active';

  @IsNotEmpty()
  @ValidateNested()
  value: CCBillPaymentGateway;
}
