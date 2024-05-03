import { Injectable } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { COMMENT_CHANNEL, OBJECT_TYPE } from 'src/modules/comment/contants';
import { EVENT } from 'src/kernel/constants';
import { FeedService } from '../services/feed.service';

const COMMENT_FEED_CHANNEL = 'COMMENT_FEED_CHANNEL';

@Injectable()
export class CommentFeedListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly feedService: FeedService
  ) {
    this.queueEventService.subscribe(
      COMMENT_CHANNEL,
      COMMENT_FEED_CHANNEL,
      this.handleCommentFeed.bind(this)
    );
  }

  public async handleCommentFeed(event: QueueEvent) {
    try {
      if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
        return false;
      }
      const { objectId: feedId, objectType } = event.data;
      if (objectType !== OBJECT_TYPE.FEED) {
        return false;
      }
      await this.feedService.handleCommentStat(
        feedId,
        event.eventName === EVENT.CREATED ? 1 : -1
      );
      return true;
    } catch (e) {
      // TODO - log me
      return false;
    }
  }
}
