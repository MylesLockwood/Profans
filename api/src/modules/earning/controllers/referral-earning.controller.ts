import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Query,
  Param,
  Post,
  Body
} from '@nestjs/common';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { ReferralEarningService } from '../services/referral-earning.service';
import {
  ReferralEarningSearchRequestPayload,
  UpdateEarningStatusPayload
} from '../payloads';
import { ReferralEarningDto, IReferralEarningStatResponse } from '../dtos/referral-earning.dto';
import { UserDto } from '../../user/dtos';

@Injectable()
@Controller('referral-earnings')
export class ReferralEarningController {
  constructor(private readonly referralEarningService: ReferralEarningService) {}

  @Get('/admin/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @Query() req: ReferralEarningSearchRequestPayload
  ): Promise<DataResponse<PageableData<ReferralEarningDto>>> {
    const data = await this.referralEarningService.search(req);
    return DataResponse.ok(data);
  }

  @Get('/user/search')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: ReferralEarningSearchRequestPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<ReferralEarningDto>>> {
    req.referralId = user._id;
    const data = await this.referralEarningService.search(req);
    return DataResponse.ok(data);
  }

  @Get('/admin/stats')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminStats(
    @Query() req: ReferralEarningSearchRequestPayload
  ): Promise<DataResponse<IReferralEarningStatResponse>> {
    const data = await this.referralEarningService.stats(req);
    return DataResponse.ok(data);
  }

  @Get('/user/stats')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async performerStats(
    @Query() req: ReferralEarningSearchRequestPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<IReferralEarningStatResponse>> {
    req.referralId = user._id;
    const data = await this.referralEarningService.stats(req);
    return DataResponse.ok(data);
  }

  @Post('/admin/update-status')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStats(
    @Body() payload: UpdateEarningStatusPayload
  ): Promise<DataResponse<ReferralEarningDto>> {
    const data = await this.referralEarningService.updatePaidStatus(payload);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(@Param('id') id: string): Promise<DataResponse<ReferralEarningDto>> {
    const data = await this.referralEarningService.details(id);
    return DataResponse.ok(data);
  }
}
