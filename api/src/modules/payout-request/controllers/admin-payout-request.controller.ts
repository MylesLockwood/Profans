import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Put,
  UseGuards,
  Body,
  Get,
  Delete,
  Query
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { CurrentUser, Roles } from 'src/modules/auth';
import { DataResponse } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { PayoutRequestService } from '../services/payout-request.service';
import { PayoutRequestUpdatePayload } from '../payloads/payout-request.payload';

@Injectable()
@Controller('payout-requests/admin')
export class AdminPayoutRequestController {
  constructor(private readonly payoutRequestService: PayoutRequestService) {}

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: PayoutRequestUpdatePayload
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.adminUpdate(id, payload);
    return DataResponse.ok(data);
  }

  @Get('/stats/calculate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async calculate(
    @Query() query: any,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.calculate(user, query);
    return DataResponse.ok(data);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Param('id') id: string): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.adminDelete(id);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminDetails(@Param('id') id: string): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.adminDetails(id);
    return DataResponse.ok(data);
  }
}
