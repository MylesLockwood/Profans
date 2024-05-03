import { Injectable, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { PERFORMER_UPDATE_ORIENTATION_CHANNEL } from 'src/modules/performer/constants';
import { EVENT } from 'src/kernel/constants';
import { Model } from 'mongoose';
import { FEED_PROVIDER } from '../providers';
import { FeedModel } from '../models';

const PERFORMER_ORIENTATION_TOPIC = 'PERFORMER_ORIENTATION_TOPIC';

@Injectable()
export class UpdatePerformerOrientationListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(FEED_PROVIDER)
    private readonly feedModel: Model<FeedModel>
  ) {
    this.queueEventService.subscribe(
      PERFORMER_UPDATE_ORIENTATION_CHANNEL,
      PERFORMER_ORIENTATION_TOPIC,
      this.handleUpdateOrientation.bind(this)
    );
  }

  public async handleUpdateOrientation(event: QueueEvent) {
    if (![EVENT.UPDATED].includes(event.eventName)) {
      return;
    }
    const {
      oldOrientation, sexualOrientation, _id
    } = event.data;
    if (oldOrientation === sexualOrientation) {
      return;
    }
    await this.feedModel.updateMany({
      fromSourceId: _id
    }, {
      orientation: sexualOrientation
    });
  }
}
