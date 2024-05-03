import {
  Controller,
  Injectable,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Get,
  Query
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { ReferralReportService } from '../services';
import { ReferralReportDto } from '../dtos';
import { ReferralReportSearchPayload } from '../payloads';

@Injectable()
@Controller('referral-reports')
export class ReferralReportController {
  constructor(
    private readonly referralReportService: ReferralReportService
  ) {}

  @Get('user/search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: ReferralReportSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<ReferralReportDto>>> {
    const payload = { ...req };
    payload.referralId = user._id.toString();
    const data = await this.referralReportService.search(payload);
    return DataResponse.ok(data);
  }

  @Get('admin/search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @Query() req: ReferralReportSearchPayload
  ): Promise<DataResponse<PageableData<ReferralReportDto>>> {
    const data = await this.referralReportService.search(req);
    return DataResponse.ok(data);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<ReferralReportDto>> {
    const data = await this.referralReportService.getDetails(id, user);
    return DataResponse.ok(data);
  }
}
