/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData, QueueEventService, QueueEvent } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { ProductService } from 'src/modules/performer-assets/services';
import { ObjectId } from 'mongodb';
import { FeedService } from 'src/modules/feed/services';
import { uniq } from 'lodash';
import { PerformerDto } from 'src/modules/performer/dtos';
import { FeedDto } from 'src/modules/feed/dtos';
import {
  GalleryDto, IVideoResponse, ProductDto, VideoDto
} from 'src/modules/performer-assets/dtos';
import { FileService } from 'src/modules/file/services';
import { ReactionModel } from '../models/reaction.model';
import { REACT_MODEL_PROVIDER } from '../providers/reaction.provider';
import {
  ReactionCreatePayload, ReactionSearchRequestPayload
} from '../payloads';
import { UserDto } from '../../user/dtos';
import { ReactionDto } from '../dtos/reaction.dto';
import { UserService } from '../../user/services';
import { PerformerService } from '../../performer/services';
import { REACTION_CHANNEL, REACTION_TYPE } from '../constants';

@Injectable()
export class ReactionService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => FeedService))
    private readonly feedService: FeedService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(REACT_MODEL_PROVIDER)
    private readonly reactionModel: Model<ReactionModel>,
    private readonly queueEventService: QueueEventService

  ) { }

  public async findOneQuery(query) {
    return this.reactionModel.findOne(query).lean();
  }

  public async findByQuery(query) {
    return this.reactionModel.find(query).lean();
  }

  public async create(
    data: ReactionCreatePayload,
    user: UserDto
  ): Promise<ReactionDto> {
    const reaction = { ...data } as any;
    const existReact = await this.reactionModel.findOne({
      objectType: reaction.objectType,
      objectId: reaction.objectId,
      createdBy: user._id,
      action: reaction.action
    });
    if (existReact) {
      return existReact;
    }
    reaction.createdBy = user._id;
    reaction.createdAt = new Date();
    reaction.updatedAt = new Date();
    const newreaction = await this.reactionModel.create(reaction);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: REACTION_CHANNEL,
        eventName: EVENT.CREATED,
        data: new ReactionDto(newreaction)
      })
    );
    return newreaction;
  }

  public async remove(payload: ReactionCreatePayload, user: UserDto) {
    const reaction = await this.reactionModel.findOne({
      objectType: payload.objectType,
      objectId: payload.objectId,
      createdBy: user._id,
      action: payload.action
    });
    if (!reaction) {
      return false;
    }
    await reaction.remove();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: REACTION_CHANNEL,
        eventName: EVENT.DELETED,
        data: new ReactionDto(reaction)
      })
    );
    return true;
  }

  public async search(
    req: ReactionSearchRequestPayload
  ): Promise<PageableData<ReactionDto>> {
    const query = {} as any;
    if (req.objectId) {
      query.objectId = req.objectId;
    }
    const sort = {
      createdAt: -1
    };
    const [data, total] = await Promise.all([
      this.reactionModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.reactionModel.countDocuments(query)
    ]);
    const reactions = data.map((d) => new ReactionDto(d));
    const UIds = data.map((d) => d.createdBy);
    const [users, performers] = await Promise.all([
      UIds.length ? this.userService.findByIds(UIds) : [],
      UIds.length ? this.performerService.findByIds(UIds) : []
    ]);
    reactions.forEach((reaction: ReactionDto) => {
      const performer = performers.find(
        (p) => p._id.toString() === reaction.createdBy.toString()
      );
      const user = users.find(
        (u) => u._id.toString() === reaction.createdBy.toString()
      );
      // eslint-disable-next-line no-param-reassign
      reaction.creator = performer || user;
    });
    return {
      data: reactions,
      total
    };
  }

  public async getListProduct(req: ReactionSearchRequestPayload) {
    const query = {} as any;
    if (req.createdBy) query.createdBy = req.createdBy;
    if (req.action) query.action = req.action;
    query.objectType = REACTION_TYPE.PRODUCT;

    const sort = {
      [req.sortBy || 'createdAt']: req.sort === 'desc' ? -1 : 1
    };
    const [items, total] = await Promise.all([
      this.reactionModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.reactionModel.countDocuments(query)
    ]);

    const productIds = uniq(items.map((i) => i.objectId));
    const products = productIds.length > 0 ? await this.productService.findByIds(productIds) : [];
    const fileIds = products.map((p) => p.imageId);
    const images = fileIds.length ? await this.fileService.findByIds(fileIds) : [];
    const reactions = items.map((v) => new ReactionDto(v));
    reactions.forEach((item) => {
      const product = products.find((p) => `${p._id}` === `${item.objectId}`);
      if (product) {
        const p = new ProductDto(product);
        p.image = images.find((f) => f._id.toString() === p.imageId.toString());
        item.objectInfo = p;
      }
    });

    return {
      data: reactions,
      total
    };
  }

  public async getListPerformer(req: ReactionSearchRequestPayload) {
    const query = {} as any;
    if (req.createdBy) query.createdBy = req.createdBy;
    if (req.action) query.action = req.action;
    query.objectType = REACTION_TYPE.PERFORMER;

    const sort = {
      [req.sortBy || 'createdAt']: req.sort === 'desc' ? -1 : 1
    };
    const [items, total] = await Promise.all([
      this.reactionModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.reactionModel.countDocuments(query)
    ]);

    const performerIds = uniq(items.map((i) => i.objectId));
    const performers = await this.performerService.findByIds(performerIds);
    const reactions = items.map((v) => new ReactionDto(v));
    reactions.forEach((item) => {
      const performer = performers.find((p) => `${p._id}` === `${item.objectId}`);
      item.objectInfo = performer ? new PerformerDto(performer).toSearchResponse() : null;
    });

    return {
      data: reactions,
      total
    };
  }

  public async getListUser(req: ReactionSearchRequestPayload, user: UserDto) {
    const query = {} as any;
    if (req.action) query.action = req.action;
    query.objectType = REACTION_TYPE.PERFORMER;
    query.objectId = user._id;

    const sort = {
      [req.sortBy || 'createdAt']: req.sort === 'desc' ? -1 : 1
    };
    const [items, total] = await Promise.all([
      this.reactionModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.reactionModel.countDocuments(query)
    ]);

    const userIds = uniq(items.map((i) => i.createdBy));
    const users = await this.userService.findByIds(userIds);
    const reactions = items.map((v) => new ReactionDto(v));
    reactions.forEach((item) => {
      const u = users.find((p) => `${p._id}` === `${item.createdBy}`);
      item.objectInfo = u ? new UserDto(u).toResponse() : null;
    });

    return {
      data: reactions,
      total
    };
  }

  public async getListFeeds(req: ReactionSearchRequestPayload, user: UserDto, jwToken: string) {
    const query = {} as any;
    if (req.createdBy) query.createdBy = req.createdBy;
    if (req.action) query.action = req.action;
    if (req.objectType) {
      query.objectType = req.objectType;
    }

    const sort = {
      [req.sortBy || 'createdAt']: req.sort === 'desc' ? -1 : 1
    };
    const [items, total] = await Promise.all([
      this.reactionModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.reactionModel.countDocuments(query)
    ]);

    const feedIds = uniq(items.map((i) => i.objectId));
    const feeds = await this.feedService.findByIds(feedIds, user, jwToken);
    const reactions = items.map((v) => new ReactionDto(v));
    reactions.forEach((item) => {
      const feed = feeds.find((p) => `${p._id}` === `${item.objectId}`);
      item.objectInfo = feed ? new FeedDto(feed) : null;
    });

    return {
      data: reactions,
      total
    };
  }

  public async checkExisting(objectId: string | ObjectId, userId: string | ObjectId, action: string, objectType: string) {
    return this.reactionModel.countDocuments({
      objectId, createdBy: userId, action, objectType
    });
  }
}
