import {
  IsString,
  IsOptional,
  Validate,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsArray,
  MinLength,
  IsNumber,
  Min,
  IsBoolean
} from 'class-validator';
import { Username } from 'src/modules/user/validators/username.validator';
import { GENDERS } from 'src/modules/user/constants';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { PERFORMER_STATUSES } from '../constants';

export class PerformerCreatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Validate(Username)
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password?: string;

  @ApiProperty()
  @IsString()
  @IsIn([PERFORMER_STATUSES.ACTIVE, PERFORMER_STATUSES.INACTIVE, PERFORMER_STATUSES.PENDING])
  @IsOptional()
  status = PERFORMER_STATUSES.ACTIVE;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  verifiedEmail?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  verifiedAccount?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneCode?: string; // international code prefix

  @ApiProperty()
  @IsString()
  @IsOptional()
  avatarId?: ObjectId;

  @ApiProperty()
  @IsString()
  @IsOptional()
  coverId?: ObjectId;

  @ApiProperty()
  @IsString()
  @IsOptional()
  idVerificationId?: ObjectId;

  @ApiProperty()
  @IsString()
  @IsOptional()
  documentVerificationId?: ObjectId;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(GENDERS)
  gender?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  zipcode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  height?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  weight?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  hair?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pubicHair?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  butt?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ethnicity?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  eyes?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sexualOrientation: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isFreeSubscription: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsOptional()
  monthlyPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsOptional()
  yearlyPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsOptional()
  publicChatPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsOptional()
  privateChatPrice: number;

  @ApiProperty()
  @IsOptional()
  bankingInfomation?: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dateOfBirth: string
}

export class PerformerRegisterPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Validate(Username)
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @ApiProperty()
  @IsString()
  @IsIn([PERFORMER_STATUSES.ACTIVE, PERFORMER_STATUSES.INACTIVE, PERFORMER_STATUSES.PENDING])
  @IsOptional()
  status = PERFORMER_STATUSES.ACTIVE;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneCode?: string; // international code prefix

  @ApiProperty()
  @IsString()
  @IsOptional()
  avatarId?: ObjectId;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  verifiedEmail?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  verifiedAccount?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  idVerificationId?: ObjectId;

  @ApiProperty()
  @IsString()
  @IsOptional()
  documentVerificationId?: ObjectId;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(GENDERS)
  gender?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dateOfBirth: string
}
