/* eslint-disable no-nested-ternary */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEventService, QueueEvent } from 'src/kernel';
import {
  PAYMENT_TYPE,
  ORDER_PAID_SUCCESS_CHANNEL
} from 'src/modules/payment/constants';
import { EVENT, STATUS } from 'src/kernel/constants';
import * as moment from 'moment';
import { OrderModel, PaymentTransactionModel } from 'src/modules/payment/models';
import { PerformerService } from 'src/modules/performer/services';
import { UserService } from 'src/modules/user/services';
import { MailerService } from 'src/modules/mailer';
import { SubscriptionModel } from '../models/subscription.model';
import { SUBSCRIPTION_MODEL_PROVIDER } from '../providers/subscription.provider';
import { SubscriptionDto } from '../dtos/subscription.dto';
import {
  UPDATE_PERFORMER_SUBSCRIPTION_CHANNEL,
  SUBSCRIPTION_TYPE
} from '../constants';

const UPDATE_SUBSCRIPTION_CHANNEL = 'UPDATE_SUBSCRIPTION_CHANNEL';

@Injectable()
export class OrderSubscriptionListener {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(SUBSCRIPTION_MODEL_PROVIDER)
    private readonly subscriptionModel: Model<SubscriptionModel>,
    private readonly queueEventService: QueueEventService,
    private readonly mailService: MailerService
  ) {
    this.queueEventService.subscribe(
      ORDER_PAID_SUCCESS_CHANNEL,
      UPDATE_SUBSCRIPTION_CHANNEL,
      this.handleListenSubscription.bind(this)
    );
  }

  public async handleListenSubscription(
    event: QueueEvent
    // transactionPayload: any, eventType?: string
  ): Promise<any> {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
      return;
    }
    const { transaction, order } = event.data;
    if (![PAYMENT_TYPE.YEARLY_SUBSCRIPTION, PAYMENT_TYPE.MONTHLY_SUBSCRIPTION, PAYMENT_TYPE.FREE_SUBSCRIPTION].includes(order.type)) {
      return;
    }
    // not support for other gateway
    if (transaction.paymentGateway !== 'ccbill') {
      return;
    }
    await this.handleCCBillSubscription(order, transaction, event.eventName);
  }

  private async handleCCBillSubscription(order: OrderModel, transaction: PaymentTransactionModel, eventName) {
    const existSubscription = await this.subscriptionModel.findOne({
      userId: order.buyerId,
      performerId: order.sellerId
    });
    const expiredAt = transaction.type === PAYMENT_TYPE.MONTHLY_SUBSCRIPTION
      ? moment()
        .add(30, 'days')
        .toDate()
      : transaction.type === PAYMENT_TYPE.YEARLY_SUBSCRIPTION
        ? moment()
          .add(365, 'days')
          .toDate()
        : moment()
          .add(99, 'years')
          .toDate();
    const subscriptionType = transaction.type === PAYMENT_TYPE.MONTHLY_SUBSCRIPTION
      ? SUBSCRIPTION_TYPE.MONTHLY
      : transaction.type === PAYMENT_TYPE.YEARLY_SUBSCRIPTION ? SUBSCRIPTION_TYPE.YEARLY
        : SUBSCRIPTION_TYPE.FREE;
    const subscriptionId = transaction?.paymentResponseInfo?.subscriptionId
    || transaction?.paymentResponseInfo?.subscription_id || null;
    const paymentResponseInfo = transaction?.paymentResponseInfo || {} as any;
    const { paymentGateway } = transaction;
    const startRecurringDate = paymentResponseInfo?.renewalDate || paymentResponseInfo?.timestamp;
    const nextRecurringDate = paymentResponseInfo?.nextRenewalDate;
    if (existSubscription) {
      existSubscription.expiredAt = new Date(expiredAt);
      existSubscription.updatedAt = new Date();
      existSubscription.subscriptionType = subscriptionType;
      existSubscription.transactionId = transaction._id;
      existSubscription.meta = paymentResponseInfo;
      existSubscription.subscriptionId = subscriptionId || '';
      existSubscription.paymentGateway = paymentGateway;
      existSubscription.startRecurringDate = startRecurringDate
        ? new Date(startRecurringDate)
        : new Date();
      existSubscription.nextRecurringDate = nextRecurringDate
        ? new Date(nextRecurringDate)
        : new Date(expiredAt);
      existSubscription.status = STATUS.ACTIVE;
      await existSubscription.save();
      await this.handleMailerSubscription(new SubscriptionDto(existSubscription));
      return;
    }

    const newSubscription = await this.subscriptionModel.create({
      performerId: order.sellerId,
      userId: order.buyerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiredAt: new Date(expiredAt),
      subscriptionType,
      subscriptionId,
      meta: paymentResponseInfo,
      paymentGateway,
      startRecurringDate: startRecurringDate
        ? new Date(startRecurringDate)
        : new Date(),
      nextRecurringDate: nextRecurringDate
        ? new Date(nextRecurringDate)
        : new Date(expiredAt),
      transactionId: transaction._id,
      status: STATUS.ACTIVE
    });
    await this.handleMailerSubscription(new SubscriptionDto(newSubscription));
    await this.queueEventService.publish(
      new QueueEvent({
        channel: UPDATE_PERFORMER_SUBSCRIPTION_CHANNEL,
        eventName,
        data: new SubscriptionDto(newSubscription)
      })
    );
  }

  public async handleMailerSubscription(subscription: SubscriptionDto) {
    const [user, performer] = await Promise.all([
      this.userService.findById(subscription.userId),
      this.performerService.findById(subscription.performerId)
    ]);
    if (!user || !performer) return;
    if (performer.email) {
      await this.mailService.send({
        subject: 'New Subscription',
        to: performer.email,
        data: {
          performer,
          user
        },
        template: 'performer-new-subscription.html'
      });
    }
  }
}
