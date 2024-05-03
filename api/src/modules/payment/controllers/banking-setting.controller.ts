import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  Put,
  Body,
  UseGuards
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { AuthGuard } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';
import { BankingSettingPayload } from '../payloads';
import { BankingSettingService } from '../services';
@Injectable()
@Controller('banking-settings')
export class BankingSettingController {
  constructor(
    private readonly bankingSettingService: BankingSettingService
  ) {}

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateBankingSetting(
    @Body() payload: BankingSettingPayload,
    @CurrentUser() user: UserDto
  ) {
    const data = await this.bankingSettingService.updateBankingSetting(payload, user);
    return DataResponse.ok(data);
  }
}
