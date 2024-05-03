import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
  Param,
  Put,
  Body
} from '@nestjs/common';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { Roles, CurrentUser } from 'src/modules/auth';
import { OrderService } from '../services';
import { OrderDto } from '../dtos';
import { OrderSearchPayload, OrderUpdatePayload } from '../payloads';
@Injectable()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/details/search')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async ordersDetails(
    @Query() req: OrderSearchPayload,
    @CurrentUser() user: any
  ): Promise<DataResponse<PageableData<any>>> {
    if (user.isPerformer) req.sellerId = user._id;

    const data = await this.orderService.orderDetailsSearch(req);
    return DataResponse.ok(data);
  }

  /**
   * payment history search
   * @param req
   * @param user
   */
  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async orders(
    @Query() req: OrderSearchPayload,
    @CurrentUser() user: any
  ): Promise<DataResponse<PageableData<OrderDto>>> {
    if (user.isPerformer) req.sellerId = user._id;

    const data = await this.orderService.search(req);
    return DataResponse.ok(data);
  }

  @Get('/users/details/search')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userDetailsOrders(
    @Query() req: OrderSearchPayload,
    @CurrentUser() user: any
  ): Promise<DataResponse<PageableData<OrderDto>>> {
    req.buyerId = user._id;
    const data = await this.orderService.orderDetailsSearch(req) as any;
    return DataResponse.ok(data);
  }

  @Get('/users/search')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userOrders(
    @Query() req: OrderSearchPayload,
    @CurrentUser() user: any
  ): Promise<DataResponse<PageableData<OrderDto>>> {
    req.buyerId = user._id;
    const data = await this.orderService.search(req) as any;
    return DataResponse.ok(data);
  }

  @Put('/:id/update')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() payload: OrderUpdatePayload,
    @CurrentUser() user: any
  ): Promise<DataResponse<any>> {
    const data = await this.orderService.updateDetails(id, payload, user);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.orderService.getOrderDetails(id);
    return DataResponse.ok(data);
  }

  @Get('/details/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details2(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.orderService.getOrderDetails(id);
    return DataResponse.ok(data);
  }
}
