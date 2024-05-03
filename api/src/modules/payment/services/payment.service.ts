import {
  Injectable,
  Inject,
  forwardRef,
  BadRequestException
} from '@nestjs/common';
import {
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { UserDto } from 'src/modules/user/dtos';
import { PAYMENT_TRANSACTION_MODEL_PROVIDER } from '../providers';
import { OrderModel, PaymentTransactionModel } from '../models';
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  TRANSACTION_SUCCESS_CHANNEL
} from '../constants';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import { CCBillService } from './ccbill.service';
import { OrderService } from './order.service';
import { MissingConfigPaymentException } from '../exceptions';
import { PaymentGatewaySettingService } from './payment-gateway-setting.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService,
    @Inject(PAYMENT_TRANSACTION_MODEL_PROVIDER)
    private readonly paymentTransactionModel: Model<PaymentTransactionModel>,
    private readonly ccbillService: CCBillService,
    private readonly queueEventService: QueueEventService,
    private readonly orderService: OrderService,
    private readonly paymentGatewaySettingService: PaymentGatewaySettingService
  ) { }

  public async findById(id: string | ObjectId) {
    return this.paymentTransactionModel.findById(id);
  }

  private async getPerformerSinglePaymentGatewaySetting(performerId, paymentGateway = 'ccbill') {
    // get performer information and do transaction
    const performerPaymentSetting = await this.paymentGatewaySettingService.getPaymentSetting(
      performerId,
      paymentGateway
    );
    if (!performerPaymentSetting) {
      throw new MissingConfigPaymentException();
    }
    const ccbillClientAccNo = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CLIENT_ACCOUNT_NUMBER);
    const username = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_DATALINK_USERNAME);
    const password = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_DATALINK_PASSWORD);
    const subAccountNumber = performerPaymentSetting?.value?.singlePurchaseSubAccountNumber;
    if (!ccbillClientAccNo || !username || !subAccountNumber || !password) {
      throw new MissingConfigPaymentException();
    }

    return {
      ccbillClientAccNo,
      username,
      subAccountNumber,
      password
    };
  }

  private async getPerformerSubscriptionPaymentGatewaySetting(performerId, paymentGateway = 'ccbill') {
    // get performer information and do transaction
    const performerPaymentSetting = await this.paymentGatewaySettingService.getPaymentSetting(
      performerId,
      paymentGateway
    );
    if (!performerPaymentSetting) {
      throw new MissingConfigPaymentException();
    }
    const ccbillClientAccNo = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CLIENT_ACCOUNT_NUMBER);
    const username = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_DATALINK_USERNAME);
    const password = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_DATALINK_PASSWORD);
    const subAccountNumber = performerPaymentSetting?.value?.subscriptionSubAccountNumber;
    if (!ccbillClientAccNo || !username || !subAccountNumber || !password) {
      throw new MissingConfigPaymentException();
    }

    return {
      ccbillClientAccNo,
      username,
      subAccountNumber,
      password
    };
  }

  private async getCCbillPaymentGatewaySettings() {
    const flexformId = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_FLEXFORM_ID);
    const subAccountNumber = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_SUB_ACCOUNT_NUMBER);
    const salt = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_SALT);
    // const currencyCode = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CURRENCY_CODE);
    if (!flexformId || !subAccountNumber || !salt) {
      throw new MissingConfigPaymentException();
    }

    return {
      flexformId,
      subAccountNumber,
      salt
      // currencyCode
    };
  }

  public async subscribePerformer(order: OrderModel, user: UserDto, paymentGateway = 'ccbill') {
    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: order.type,
      totalPrice: order.totalPrice,
      products: [],
      status: order.type === PAYMENT_TYPE.FREE_SUBSCRIPTION ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.PENDING,
      paymentResponseInfo: null
    });
    if (order.type === PAYMENT_TYPE.FREE_SUBSCRIPTION) {
      await this.queueEventService.publish(
        new QueueEvent({
          channel: TRANSACTION_SUCCESS_CHANNEL,
          eventName: EVENT.CREATED,
          data: transaction
        })
      );
      return { success: true };
    }
    const {
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber
    } = await this.getPerformerSubscriptionPaymentGatewaySetting(order.sellerId);
    if (!user.authorisedCard || !user.ccbillCardToken) {
      throw new MissingConfigPaymentException();
    }
    const resp = await this.ccbillService.subscription({
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber,
      price: order.totalPrice,
      subscriptionType: order.type,
      subscriptionId: user.ccbillCardToken,
      transactionId: transaction._id
    });
    if (resp) {
      // transaction.status = PAYMENT_STATUS.SUCCESS;
      // await transaction.save();
      // await this.queueEventService.publish(
      //   new QueueEvent({
      //     channel: TRANSACTION_SUCCESS_CHANNEL,
      //     eventName: EVENT.CREATED,
      //     data: transaction
      //   })
      // );
      return { success: true };
    }
    return { success: false };
  }

  public async purchasePerformerProducts(order: OrderModel, user: UserDto, paymentGateway = 'ccbill') {
    const {
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber
    } = await this.getPerformerSinglePaymentGatewaySetting(order.sellerId);
    if (!user.authorisedCard || !user.ccbillCardToken) {
      throw new MissingConfigPaymentException();
    }

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.PERFORMER_PRODUCT,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING,
      products: []
    });

    const resp = await this.ccbillService.singlePurchase({
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber,
      price: order.totalPrice,
      subscriptionId: user.ccbillCardToken,
      transactionId: transaction._id
    });
    if (resp) {
      // transaction.status = PAYMENT_STATUS.SUCCESS;
      // await transaction.save();
      // await this.queueEventService.publish(
      //   new QueueEvent({
      //     channel: TRANSACTION_SUCCESS_CHANNEL,
      //     eventName: EVENT.CREATED,
      //     data: transaction
      //   })
      // );
      return { success: true };
    }
    return { success: false };
  }

  public async purchasePerformerVOD(order: OrderModel, user: UserDto, paymentGateway = 'ccbill') {
    const {
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber
    } = await this.getPerformerSinglePaymentGatewaySetting(order.sellerId);
    if (!user.authorisedCard || !user.ccbillCardToken) {
      throw new MissingConfigPaymentException();
    }

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.PERFORMER_VIDEO,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING,
      products: []
    });
    const resp = await this.ccbillService.singlePurchase({
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber,
      price: order.totalPrice,
      subscriptionId: user.ccbillCardToken,
      transactionId: transaction._id
    });
    if (resp) {
      // transaction.status = PAYMENT_STATUS.SUCCESS;
      // await transaction.save();
      // await this.queueEventService.publish(
      //   new QueueEvent({
      //     channel: TRANSACTION_SUCCESS_CHANNEL,
      //     eventName: EVENT.CREATED,
      //     data: transaction
      //   })
      // );
      return { success: true };
    }
    return { success: false };
  }

  public async purchasePerformerPost(order: OrderModel, user: UserDto, paymentGateway = 'ccbill') {
    const {
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber
    } = await this.getPerformerSinglePaymentGatewaySetting(order.sellerId);
    if (!user.authorisedCard || !user.ccbillCardToken) {
      throw new MissingConfigPaymentException();
    }

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.PERFORMER_POST,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING,
      products: []
    });
    const resp = await this.ccbillService.singlePurchase({
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber,
      price: order.totalPrice,
      subscriptionId: user.ccbillCardToken,
      transactionId: transaction._id
    });
    if (resp) {
      // transaction.status = PAYMENT_STATUS.SUCCESS;
      // await transaction.save();
      // await this.queueEventService.publish(
      //   new QueueEvent({
      //     channel: TRANSACTION_SUCCESS_CHANNEL,
      //     eventName: EVENT.CREATED,
      //     data: transaction
      //   })
      // );
      return { success: true };
    }
    return { success: false };
  }

  public async purchasePerformerStream(order: OrderModel, user: UserDto, paymentGateway = 'ccbill') {
    const {
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber
    } = await this.getPerformerSinglePaymentGatewaySetting(order.sellerId);
    if (!user.authorisedCard || !user.ccbillCardToken) {
      throw new MissingConfigPaymentException();
    }

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: order.type,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING,
      products: []
    });
    const resp = await this.ccbillService.singlePurchase({
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber,
      price: order.totalPrice,
      subscriptionId: user.ccbillCardToken,
      transactionId: transaction._id
    });
    if (resp) {
      // transaction.status = PAYMENT_STATUS.SUCCESS;
      // await transaction.save();
      // await this.queueEventService.publish(
      //   new QueueEvent({
      //     channel: TRANSACTION_SUCCESS_CHANNEL,
      //     eventName: EVENT.CREATED,
      //     data: transaction
      //   })
      // );
      return { success: true };
    }
    return { success: false };
  }

  public async tipPerformer(order: OrderModel, user: UserDto, paymentGateway = 'ccbill') {
    const {
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber
    } = await this.getPerformerSinglePaymentGatewaySetting(order.sellerId);
    if (!user.authorisedCard || !user.ccbillCardToken) {
      throw new MissingConfigPaymentException();
    }

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.TIP_PERFORMER,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.SUCCESS,
      products: []
    });
    const resp = await this.ccbillService.singlePurchase({
      username,
      password,
      ccbillClientAccNo,
      subAccountNumber,
      price: order.totalPrice,
      subscriptionId: user.ccbillCardToken,
      transactionId: transaction._id
    });
    if (resp) {
      // transaction.status = PAYMENT_STATUS.SUCCESS;
      // await transaction.save();
      // await this.queueEventService.publish(
      //   new QueueEvent({
      //     channel: TRANSACTION_SUCCESS_CHANNEL,
      //     eventName: EVENT.CREATED,
      //     data: transaction
      //   })
      // );
      return { success: true };
    }
    return { success: false };
  }

  public async authoriseCard(order: OrderModel, paymentGateway = 'ccbill') {
    const {
      flexformId,
      subAccountNumber,
      salt
    } = await this.getCCbillPaymentGatewaySettings();

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.AUTHORISE_CARD,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING,
      products: []
    });
    return this.ccbillService.authoriseCard({
      salt,
      flexformId,
      subAccountNumber,
      price: order.totalPrice,
      transactionId: transaction._id
    });
  }

  public async ccbillSinglePaymentSuccessWebhook(payload: Record<string, any>) {
    const transactionId = payload['X-transactionId'] || payload.transactionId;
    if (!transactionId) {
      throw new BadRequestException();
    }
    const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
    if (!checkForHexRegExp.test(transactionId)) {
      return { success: false };
    }
    const transaction = await this.paymentTransactionModel.findById(
      transactionId
    );
    if (!transaction || transaction.status !== PAYMENT_STATUS.PENDING) {
      return { success: false };
    }
    transaction.status = PAYMENT_STATUS.SUCCESS;
    transaction.paymentResponseInfo = payload;
    transaction.updatedAt = new Date();
    await transaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: TRANSACTION_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: transaction
      })
    );
    return { success: true };
  }

  public async ccbillRenewalSuccessWebhook(payload: any) {
    const subscriptionId = payload.subscriptionId || payload.subscription_id;
    if (!subscriptionId) {
      throw new BadRequestException();
    }

    const subscription = await this.subscriptionService.findBySubscriptionId(subscriptionId);
    if (!subscription) {
      // TODO - should check in case admin delete subscription??
      // TODO - log me
      return { success: false };
    }

    // create user order and transaction for this order
    const price = payload.billedAmount || payload.accountingAmount;
    const { userId } = subscription;
    const { performerId } = subscription;
    const order = await this.orderService.createForPerformerSubscriptionRenewal({
      userId,
      performerId,
      price,
      type: subscription.subscriptionType
    });

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway: 'ccbill',
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: order.type,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.SUCCESS,
      paymentResponseInfo: payload,
      products: []
    });

    await this.queueEventService.publish(
      new QueueEvent({
        channel: TRANSACTION_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: transaction
      })
    );
    return { success: true };
  }
}
