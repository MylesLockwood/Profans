import { Injectable, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { Model } from 'mongoose';
import { EVENT } from 'src/kernel/constants';
import { PERFORMER_FEED_CHANNEL, POLL_TARGET_SOURCE, VOTE_FEED_CHANNEL } from '../constants';
import { POLL_PROVIDER } from '../providers';
import { PollModel } from '../models';

const POLL_FEED_TOPIC = 'POLL_FEED_TOPIC';
const VOTE_POLL_TOPIC = 'VOTE_POLL_TOPIC';

@Injectable()
export class PollFeedListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(POLL_PROVIDER)
    private readonly pollModel: Model<PollModel>
  ) {
    this.queueEventService.subscribe(
      PERFORMER_FEED_CHANNEL,
      POLL_FEED_TOPIC,
      this.handleRefPoll.bind(this)
    );

    this.queueEventService.subscribe(
      VOTE_FEED_CHANNEL,
      VOTE_POLL_TOPIC,
      this.handleVotePoll.bind(this)
    );
  }

  public async handleRefPoll(event: QueueEvent) {
    if (![EVENT.CREATED].includes(event.eventName)) {
      return;
    }
    const { pollIds, _id: feedId } = event.data;
    if (!pollIds || !pollIds.length) return;
    if (event.eventName === EVENT.CREATED) {
      await this.pollModel.updateMany({ _id: { $in: pollIds } }, { refId: feedId, fromRef: POLL_TARGET_SOURCE.FEED });
    }
  }

  public async handleVotePoll(event: QueueEvent) {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
      return;
    }
    const { targetId } = event.data;

    if (event.eventName === EVENT.CREATED) {
      await this.pollModel.updateOne({ _id: targetId }, { $inc: { totalVote: 1 } });
    }
  }
}
