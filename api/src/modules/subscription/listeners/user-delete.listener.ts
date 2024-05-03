import { Injectable, Inject } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { Model } from 'mongoose';
import { DELETE_USER_CHANNEL } from 'src/modules/user/constants';
import { EVENT } from 'src/kernel/constants';
import { UserDto } from 'src/modules/user/dtos';
import { DELETE_PERFORMER_CHANNEL } from 'src/modules/performer/constants';
import { SubscriptionModel } from '../models/subscription.model';
import { SUBSCRIPTION_MODEL_PROVIDER } from '../providers/subscription.provider';

const DELETE_USER_SUBSCRIPTION_TOPIC = 'DELETE_USER_SUBSCRIPTION_TOPIC';
const DELETE_PERFORMER_SUBSCRIPTION_TOPIC = 'DELETE_PERFORMER_SUBSCRIPTION_TOPIC';

@Injectable()
export class DeleteUserCommentListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(SUBSCRIPTION_MODEL_PROVIDER)
    private readonly subscriptionModel: Model<SubscriptionModel>
  ) {
    this.queueEventService.subscribe(
      DELETE_USER_CHANNEL,
      DELETE_USER_SUBSCRIPTION_TOPIC,
      this.handleDeleteData.bind(this)
    );
    this.queueEventService.subscribe(
      DELETE_PERFORMER_CHANNEL,
      DELETE_PERFORMER_SUBSCRIPTION_TOPIC,
      this.handleDeleteData.bind(this)
    );
  }

  private async handleDeleteData(event: QueueEvent): Promise<void> {
    if (event.eventName !== EVENT.DELETED) return;
    const user = event.data as UserDto;
    try {
      if (user.isPerformer) {
        await this.subscriptionModel.deleteMany({
          performerId: user._id
        });
        return;
      }
      await this.subscriptionModel.deleteMany({
        userId: user._id
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
