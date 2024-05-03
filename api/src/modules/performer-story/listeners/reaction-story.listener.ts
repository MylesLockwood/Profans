import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { REACTION_CHANNEL, REACTION_TYPE, REACTION } from 'src/modules/reaction/constants';
import { EVENT } from 'src/kernel/constants';
import { PerformerService } from 'src/modules/performer/services';
import { Model } from 'mongoose';
import { PERFORMER_STORY_PROVIDER } from '../providers';
import { StoryModel } from '../models/story.model';

const REACTION_STORY_CHANNEL = 'REACTION_STORY_CHANNEL';

@Injectable()
export class ReactionStoryListener {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_STORY_PROVIDER)
    private readonly storyModel: Model<StoryModel>
  ) {
    this.queueEventService.subscribe(
      REACTION_CHANNEL,
      REACTION_STORY_CHANNEL,
      this.handleReactStory.bind(this)
    );
  }

  public async handleReactStory(event: QueueEvent) {
    try {
      if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
        return false;
      }
      const { objectId, objectType, action } = event.data;
      if (objectType !== REACTION_TYPE.STORY || action !== REACTION.LIKE) {
        return false;
      }

      if (REACTION.LIKE && event.eventName === EVENT.CREATED) {
        const story = await this.storyModel.findById(objectId);

        if (story) {
          await this.storyModel.updateOne({ _id: objectId }, { $inc: { totalLike: 1 } });
          await this.performerService.updateLikeStat(story.fromSourceId, 1);
        }
      }
      if (REACTION.LIKE && event.eventName === EVENT.DELETED) {
        const story = await this.storyModel.findById(objectId);
        if (story) {
          await this.storyModel.updateOne({ _id: objectId }, { $inc: { totalLike: -1 } });
          await this.performerService.updateLikeStat(story.fromSourceId, -1);
        }
      }
      return true;
    } catch (e) {
      // TODO - log me
      return false;
    }
  }
}
