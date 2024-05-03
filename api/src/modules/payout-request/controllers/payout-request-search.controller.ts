import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Query
} from '@nestjs/common';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { PayoutRequestService } from '../services/payout-request.service';
import { PayoutRequestDto } from '../dtos/payout-request.dto';
import { PayoutRequestSearchPayload } from '../payloads/payout-request.payload';

@Injectable()
@Controller('payout-requests')
export class PayoutRequestSearchController {
  constructor(
    private readonly payoutRequestService: PayoutRequestService
  ) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @Query() req: PayoutRequestSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<PayoutRequestDto>>> {
    const data = await this.payoutRequestService.search(req, user);
    return DataResponse.ok(data);
  }

  @Get('/user/search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userSearch(
    @Query() req: PayoutRequestSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<PayoutRequestDto>>> {
    req.sourceId = user._id;
    const data = await this.payoutRequestService.search(req);
    return DataResponse.ok(data);
  }
}
