import { Injectable } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { COMMENT_CHANNEL, OBJECT_TYPE } from 'src/modules/comment/contants';
import { EVENT } from 'src/kernel/constants';
import { CommentService } from '../services/comment.service';

const REPLY_COMMENT_CHANNEL = 'REPLY_COMMENT_CHANNEL';

@Injectable()
export class ReplyCommentListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly commentService: CommentService
  ) {
    this.queueEventService.subscribe(
      COMMENT_CHANNEL,
      REPLY_COMMENT_CHANNEL,
      this.handleReplyComment.bind(this)
    );
  }

  public async handleReplyComment(event: QueueEvent) {
    try {
      if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
        return false;
      }
      const { objectId: commentId, objectType } = event.data;
      if (objectType !== OBJECT_TYPE.COMMENT) {
        return false;
      }
      await this.commentService.increaseComment(
        commentId,
        event.eventName === EVENT.CREATED ? 1 : -1
      );
      return true;
    } catch (e) {
      // TODO - log me
      return false;
    }
  }
}
