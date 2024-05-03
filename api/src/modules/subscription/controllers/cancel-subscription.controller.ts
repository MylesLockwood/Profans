import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Post,
  Param
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import {
  DataResponse, EntityNotFoundException, ForbiddenException
} from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { UserDto } from 'src/modules/user/dtos';
import { SubscriptionService } from '../services/subscription.service';
import { CancelSubscriptionService } from '../services/cancel-subscription.service';

@Injectable()
@Controller('subscriptions/cancel')
export class CancelSubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly cancelSubscriptionService: CancelSubscriptionService
  ) {}

  @Post('/admin/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminCancel(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.cancelSubscriptionService.cancelSubscription(id);
    return DataResponse.ok(data);
  }

  @Post('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userCancel(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const subscription = await this.subscriptionService.findById(id);
    if (!subscription) throw new EntityNotFoundException();
    if (subscription.userId.toString() !== user._id.toString()) throw new ForbiddenException();

    const data = await this.cancelSubscriptionService.cancelSubscription(id);
    return DataResponse.ok(data);
  }
}
