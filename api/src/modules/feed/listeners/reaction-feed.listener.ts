import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { REACTION_CHANNEL, REACTION_TYPE, REACTION } from 'src/modules/reaction/constants';
import { EVENT } from 'src/kernel/constants';
import { PerformerService } from 'src/modules/performer/services';
import { Model } from 'mongoose';
import { FEED_PROVIDER } from '../providers';
import { FeedModel } from '../models/feed.model';

const REACTION_FEED_CHANNEL = 'REACTION_FEED_CHANNEL';

@Injectable()
export class ReactionFeedListener {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    private readonly queueEventService: QueueEventService,
    @Inject(FEED_PROVIDER)
    private readonly feedModel: Model<FeedModel>
  ) {
    this.queueEventService.subscribe(
      REACTION_CHANNEL,
      REACTION_FEED_CHANNEL,
      this.handleReactFeed.bind(this)
    );
  }

  public async handleReactFeed(event: QueueEvent) {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
      return;
    }
    const { objectId, objectType, action } = event.data;
    if (![REACTION_TYPE.FEED_PHOTO, REACTION_TYPE.FEED_TEXT, REACTION_TYPE.FEED_VIDEO].includes(objectType) || action !== REACTION.LIKE) {
      return;
    }
    if (REACTION.LIKE && event.eventName === EVENT.CREATED) {
      const feed = await this.feedModel.findById(objectId);
      if (feed) {
        await this.feedModel.updateOne({ _id: objectId }, { $inc: { totalLike: 1 } });
        await this.performerService.updateLikeStat(feed.fromSourceId, 1);
      }
    }
    if (REACTION.LIKE && event.eventName === EVENT.DELETED) {
      const feed = await this.feedModel.findById(objectId);
      if (feed) {
        await this.feedModel.updateOne({ _id: objectId }, { $inc: { totalLike: -1 } });
        await this.performerService.updateLikeStat(feed.fromSourceId, -1);
      }
    }
  }
}
