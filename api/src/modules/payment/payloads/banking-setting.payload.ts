import {
  IsString, IsNotEmpty, IsOptional
} from 'class-validator';

export class BankingSettingPayload {
  @IsString()
  @IsNotEmpty()
  sourceId: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  SSN: string;

  @IsString()
  @IsNotEmpty()
  bankName?: string;

  @IsString()
  @IsNotEmpty()
  bankAccount?: string;

  @IsString()
  @IsOptional()
  bankRouting?: string;

  @IsString()
  @IsOptional()
  bankSwiftCode?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
