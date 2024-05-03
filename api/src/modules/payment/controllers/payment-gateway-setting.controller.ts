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
import { PaymentGatewaySettingPayload } from '../payloads/payment-gateway-setting.payload';
import { PaymentGatewaySettingService } from '../services';
@Injectable()
@Controller('payment-gateway-settings')
export class PaymentGatewaySettingController {
  constructor(
    private readonly paymentGatewaySettingService: PaymentGatewaySettingService
  ) {}

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updatePaymentGatewaySetting(
    @Body() payload: PaymentGatewaySettingPayload,
    @CurrentUser() user: UserDto
  ) {
    const data = await this.paymentGatewaySettingService.updatePaymentGateway(payload, user);
    return DataResponse.ok(data);
  }
}
