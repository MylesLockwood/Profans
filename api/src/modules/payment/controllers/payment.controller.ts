import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Post,
  Body,
  Param
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import {
  SubscribePerformerPayload,
  PurchaseProductsPayload,
  PurchaseVideoPayload,
  SendTipPayload,
  PurchaseFeedPayload,
  PurchaseStreamPayload
} from '../payloads';
import { UserDto } from '../../user/dtos';
import { PaymentService } from '../services/payment.service';
import { OrderService } from '../services';

@Injectable()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService
  ) {}

  @Post('/subscribe/performers')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() user: UserDto,
    @Body() payload: SubscribePerformerPayload
  ): Promise<DataResponse<any>> {
    // TODO - check business logic like user is subscribe a model
    const order = await this.orderService.createForPerformerSubscription(payload, user);
    const info = await this.paymentService.subscribePerformer(order, user);
    return DataResponse.ok(info);
  }

  /**
   * purchase a performer video
   * @param user current login user
   * @param videoId performer video
   * @param payload
   */
  @Post('/purchase-video/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseVideo(
    @CurrentUser() user: UserDto,
    @Param('id') videoId: string,
    @Body() payload: PurchaseVideoPayload
  ): Promise<DataResponse<any>> {
    // to purchase product, create new order then do the payment
    // eslint-disable-next-line no-param-reassign
    payload.videoId = videoId;
    const order = await this.orderService.createForPerformerVOD(payload, user);
    const info = await this.paymentService.purchasePerformerVOD(order, user);
    return DataResponse.ok(info);
  }

  @Post('/purchase-products')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseProducts(
    @CurrentUser() user: UserDto,
    @Body() payload: PurchaseProductsPayload
  ): Promise<DataResponse<any>> {
    // to purchase product, create new order then do the payment
    const order = await this.orderService.createForPerformerProducts(payload, user);
    const info = await this.paymentService.purchasePerformerProducts(order, user);
    return DataResponse.ok(info);
  }

  @Post('/send-tip')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendTip(
    @CurrentUser() user: UserDto,
    @Body() payload: SendTipPayload
  ): Promise<DataResponse<any>> {
    const order = await this.orderService.createForTipPerformer(payload, user);
    const info = await this.paymentService.tipPerformer(order, user);
    return DataResponse.ok(info);
  }

  @Post('/purchase-feed')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseFeed(
    @CurrentUser() user: UserDto,
    @Body() payload: PurchaseFeedPayload
  ): Promise<DataResponse<any>> {
    const order = await this.orderService.createForPerformerPost(payload, user);
    const info = await this.paymentService.purchasePerformerPost(order, user);
    return DataResponse.ok(info);
  }

  @Post('/purchase-stream')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseStream(
    @CurrentUser() user: UserDto,
    @Body() payload: PurchaseStreamPayload
  ): Promise<DataResponse<any>> {
    const order = await this.orderService.createForPerformerStream(payload, user);
    const info = await this.paymentService.purchasePerformerStream(order, user);
    return DataResponse.ok(info);
  }

  @Post('/authorise-card')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async authoriseCard(
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const order = await this.orderService.createAuthorizationCard(user);
    const info = await this.paymentService.authoriseCard(order);
    return DataResponse.ok(info);
  }
}
