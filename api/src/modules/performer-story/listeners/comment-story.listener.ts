import { Injectable } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { COMMENT_CHANNEL, OBJECT_TYPE } from 'src/modules/comment/contants';
import { EVENT } from 'src/kernel/constants';
import { StoryService } from '../services/story.service';

const COMMENT_STORY_CHANNEL = 'COMMENT_STORY_CHANNEL';

@Injectable()
export class CommentStoryListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly storyService: StoryService
  ) {
    this.queueEventService.subscribe(
      COMMENT_CHANNEL,
      COMMENT_STORY_CHANNEL,
      this.handleCommentStory.bind(this)
    );
  }

  public async handleCommentStory(event: QueueEvent) {
    try {
      if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
        return false;
      }
      const { objectId: storyId, objectType } = event.data;
      if (objectType !== OBJECT_TYPE.STORY) {
        return false;
      }
      await this.storyService.handleCommentStat(
        storyId,
        event.eventName === EVENT.CREATED ? 1 : -1
      );
      return true;
    } catch (e) {
      // TODO - log me
      return false;
    }
  }
}
