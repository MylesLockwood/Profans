import {
  Injectable, Inject, forwardRef, HttpException
} from '@nestjs/common';
import { Model } from 'mongoose';
import {
  QueueEventService,
  EntityNotFoundException,
  QueueEvent
} from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { CCBillService } from 'src/modules/payment/services';
import { SettingService } from 'src/modules/settings/services';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { PerformerService } from 'src/modules/performer/services';
import { MailerService } from 'src/modules/mailer';
import { UserService } from 'src/modules/user/services';
import { SubscriptionModel } from '../models/subscription.model';
import { SUBSCRIPTION_MODEL_PROVIDER } from '../providers/subscription.provider';
import { SubscriptionDto } from '../dtos/subscription.dto';
import {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_TYPE,
  UPDATE_PERFORMER_SUBSCRIPTION_CHANNEL
} from '../constants';

@Injectable()
export class CancelSubscriptionService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => CCBillService))
    private readonly ccbillService: CCBillService,
    @Inject(SUBSCRIPTION_MODEL_PROVIDER)
    private readonly subscriptionModel: Model<SubscriptionModel>,
    private readonly queueEventService: QueueEventService,
    private readonly settingService: SettingService,
    private readonly mailService: MailerService
  ) {
  }

  public async cancelSubscription(id: string) {
    const query = {} as any;
    if (isObjectId(id)) query._id = id;
    else query.subscriptionId = id;
    const subscription = await this.subscriptionModel.findOne(query);
    if (!subscription || subscription.status === SUBSCRIPTION_STATUS.DEACTIVATED) throw new EntityNotFoundException();
    const [user, performer] = await Promise.all([
      this.userService.findById(subscription.userId),
      this.performerService.findById(subscription.performerId)
    ]);
    if (!performer || !user) {
      throw new EntityNotFoundException();
    }
    if (!subscription.transactionId || [SUBSCRIPTION_TYPE.FREE, SUBSCRIPTION_TYPE.SYSTEM].includes(subscription.subscriptionType)) {
      subscription.status = SUBSCRIPTION_STATUS.DEACTIVATED;
      subscription.updatedAt = new Date();
      await subscription.save();
      if ([SUBSCRIPTION_TYPE.FREE, SUBSCRIPTION_TYPE.SYSTEM].includes(subscription.subscriptionType) && performer.email) {
        await this.mailService.send({
          subject: 'Cancel Subscription',
          to: performer.email,
          data: {
            performer,
            user
          },
          template: 'performer-cancel-subscription.html'
        });
      }
      return { success: true };
    }

    if (subscription.paymentGateway !== 'ccbill') {
      throw new HttpException('Not support cancel subscription for other payment gateways but ccbill', 422);
    }

    const [ccbillClientAccNo, ccbillDatalinkUsername, ccbillDatalinkPassword] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CLIENT_ACCOUNT_NUMBER),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_DATALINK_USERNAME),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_DATALINK_PASSWORD)
    ]);
    if (!ccbillClientAccNo || !ccbillDatalinkUsername || !ccbillDatalinkPassword) {
      throw new EntityNotFoundException();
    }

    const status = await this.ccbillService.cancelSubscription({
      subscriptionId: subscription.subscriptionId,
      ccbillClientAccNo,
      ccbillDatalinkUsername,
      ccbillDatalinkPassword
    });
    if (!status) throw new HttpException(`Cannot unsubscribe subscription ${subscription.subscriptionId}`, 422);
    subscription.status = SUBSCRIPTION_STATUS.DEACTIVATED;
    subscription.updatedAt = new Date();
    await subscription.save();

    await this.queueEventService.publish(
      new QueueEvent({
        channel: UPDATE_PERFORMER_SUBSCRIPTION_CHANNEL,
        eventName: EVENT.DELETED,
        // create cancel subscription order to user?
        data: new SubscriptionDto(subscription)
      })
    );

    if (performer.email) {
      await this.mailService.send({
        subject: 'Cancel Subscription',
        to: performer.email,
        data: {
          performer,
          user
        },
        template: 'performer-cancel-subscription.html'
      });
    }

    return { success: true };
  }
}
