/* eslint-disable no-param-reassign */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  EntityNotFoundException, ForbiddenException, QueueEventService, QueueEvent, PageableData
} from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { PerformerDto } from 'src/modules/performer/dtos';
import { ReactionService } from 'src/modules/reaction/services/reaction.service';
import { FeedService } from 'src/modules/feed/services';
import { StoryService } from 'src/modules/performer-story/services';
import { BlogService } from 'src/modules/performer-blog/services';
import { PerformerBlockService } from 'src/modules/block/services';
import { PerformerBlockedException } from 'src/modules/block/exceptions';
import { CommentModel } from '../models/comment.model';
import { COMMENT_MODEL_PROVIDER } from '../providers/comment.provider';
import {
  CommentCreatePayload, CommentEditPayload, CommentSearchRequestPayload
} from '../payloads';
import { UserDto } from '../../user/dtos';
import { CommentDto } from '../dtos/comment.dto';
import { UserService } from '../../user/services';
import { PerformerService } from '../../performer/services';
import { COMMENT_CHANNEL, OBJECT_TYPE } from '../contants';

@Injectable()
export class CommentService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => FeedService))
    private readonly feedService: FeedService,
    @Inject(forwardRef(() => StoryService))
    private readonly storyService: StoryService,
    @Inject(forwardRef(() => BlogService))
    private readonly blogService: BlogService,
    @Inject(forwardRef(() => PerformerBlockService))
    private readonly performerBlockService: PerformerBlockService,
    @Inject(COMMENT_MODEL_PROVIDER)
    private readonly commentModel: Model<CommentModel>,
    private readonly queueEventService: QueueEventService,
    private readonly reactionService: ReactionService
  ) {}

  public async increaseComment(commentId, num = 1) {
    await this.commentModel.updateOne({ _id: commentId }, { $inc: { totalReply: num } });
  }

  public async create(
    payload: CommentCreatePayload,
    user: UserDto
  ): Promise<CommentDto> {
    const data = { ...payload } as any;
    // check block
    if (data.objectType === OBJECT_TYPE.COMMENT) {
      const comment = await this.commentModel.findById(data.objectId);
      if (!comment) throw new EntityNotFoundException();
      const isBlocked = await this.performerBlockService.checkBlockedByPerformer(comment.createdBy, user._id);
      if (isBlocked) throw new PerformerBlockedException();
    }
    if (data.objectType === OBJECT_TYPE.FEED) {
      const feed = await this.feedService.findById(data.objectId);
      if (!feed) throw new EntityNotFoundException();
      const isBlocked = await this.performerBlockService.checkBlockedByPerformer(feed.fromSourceId, user._id);
      if (isBlocked) throw new PerformerBlockedException();
    }
    if (data.objectType === OBJECT_TYPE.STORY) {
      const story = await this.storyService.findById(data.objectId);
      if (!story) throw new EntityNotFoundException();
      const isBlocked = await this.performerBlockService.checkBlockedByPerformer(story.fromSourceId, user._id);
      if (isBlocked) throw new PerformerBlockedException();
    }
    data.createdBy = user._id;
    data.createdAt = new Date();
    data.updatedAt = new Date();
    const newComment = await this.commentModel.create(data);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: COMMENT_CHANNEL,
        eventName: EVENT.CREATED,
        data: new CommentDto(newComment)
      })
    );
    const returnData = new CommentDto(newComment);
    returnData.creator = user;
    return returnData;
  }

  public async update(
    id: string | ObjectId,
    payload: CommentEditPayload,
    user: UserDto
  ): Promise<any> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new EntityNotFoundException();
    }
    const data = { ...payload };
    if (comment.createdBy.toString() !== user._id.toString()) {
      throw new ForbiddenException();
    }
    await this.commentModel.updateOne({ _id: id }, data);
    return { updated: true };
  }

  public async delete(
    id: string | ObjectId,
    user: UserDto
  ) {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new EntityNotFoundException();
    }
    if (comment.createdBy.toString() !== user._id.toString()) {
      throw new ForbiddenException();
    }
    await this.commentModel.deleteOne({ _id: id });
    await this.queueEventService.publish(
      new QueueEvent({
        channel: COMMENT_CHANNEL,
        eventName: EVENT.DELETED,
        data: new CommentDto(comment)
      })
    );
    return comment;
  }

  public async search(
    req: CommentSearchRequestPayload,
    user: UserDto
  ): Promise<PageableData<CommentDto>> {
    const query = {} as any;
    if (req.objectId) {
      query.objectId = req.objectId;
    }
    const sort = {
      createdAt: -1
    };
    const [data, total] = await Promise.all([
      this.commentModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.commentModel.countDocuments(query)
    ]);
    const comments = data.map((d) => new CommentDto(d));
    const commentIds = data.map((d) => d._id);
    const UIds = data.map((d) => d.createdBy);
    const [users, performers, reactions] = await Promise.all([
      UIds.length ? this.userService.findByIds(UIds) : [],
      UIds.length ? this.performerService.findByIds(UIds) : [],
      user && commentIds.length ? this.reactionService.findByQuery({ objectId: { $in: commentIds }, createdBy: user._id }) : []
    ]);
    comments.forEach((comment: CommentDto) => {
      const performer = performers.find((p) => p._id.toString() === comment.createdBy.toString());
      const userComment = users.find((u) => u._id.toString() === comment.createdBy.toString());
      const liked = reactions.find((reaction) => reaction.objectId.toString() === comment._id.toString());
      comment.creator = performer ? new PerformerDto(performer).toPublicDetailsResponse() : new UserDto(userComment).toResponse();
      comment.isLiked = !!liked;
    });
    return {
      data: comments,
      total
    };
  }
}
