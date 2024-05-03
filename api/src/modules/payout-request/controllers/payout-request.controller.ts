import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Get,
  Post,
  UseGuards,
  Body,
  Put,
  Query
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { PayoutRequestCreatePayload, PayoutRequestPerformerUpdatePayload } from '../payloads/payout-request.payload';
import { PayoutRequestService } from '../services/payout-request.service';

@Injectable()
@Controller('payout-requests/user')
export class PayoutRequestController {
  constructor(private readonly payoutRequestService: PayoutRequestService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: PayoutRequestCreatePayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.create(payload, user);
    return DataResponse.ok(data);
  }

  @Get('/calculate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async calculate(
    @Query() query: any,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.calculate(user, query);
    return DataResponse.ok(data);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() payload: PayoutRequestPerformerUpdatePayload,
    @CurrentUser() performer: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.userUpdate(id, payload, performer);
    return DataResponse.ok(data);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.details(id, user);
    return DataResponse.ok(data);
  }
}
