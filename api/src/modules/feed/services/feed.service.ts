/* eslint-disable no-await-in-loop */
import {
  Injectable, Inject, forwardRef
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  EntityNotFoundException, QueueEventService, QueueEvent, ForbiddenException
} from 'src/kernel';
import { uniq } from 'lodash';
import { PerformerService } from 'src/modules/performer/services';
import { FileService, FILE_EVENT } from 'src/modules/file/services';
import { ReactionService } from 'src/modules/reaction/services/reaction.service';
import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';
import { OrderService } from 'src/modules/payment/services';
import { FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import { EVENT, STATUS } from 'src/kernel/constants';
import { REACTION } from 'src/modules/reaction/constants';
import {
  ORDER_STATUS, PAYMENT_STATUS, PRODUCT_TYPE
} from 'src/modules/payment/constants';
import { SUBSCRIPTION_STATUS } from 'src/modules/subscription/constants';
import { REF_TYPE } from 'src/modules/file/constants';
import { SEARCH_CHANNEL } from 'src/modules/search/constants';
import * as moment from 'moment';
import { PerformerDto } from 'src/modules/performer/dtos';
import { FeedDto, PollDto } from '../dtos';
import { InvalidFeedTypeException, AlreadyVotedException, PollExpiredException } from '../exceptions';
import {
  FEED_SOURCE, FEED_TYPES, POLL_TARGET_SOURCE,
  PERFORMER_FEED_CHANNEL, VOTE_FEED_CHANNEL, FEED_VIDEO_CHANNEL
} from '../constants';
import { FeedCreatePayload, FeedSearchRequest, PollCreatePayload } from '../payloads';
import { FeedModel, PollModel, VoteModel } from '../models';
import { FEED_PROVIDER, POLL_PROVIDER, VOTE_PROVIDER } from '../providers';

const FEED_FILE_PROCESSED_TOPIC = 'FEED_FILE_PROCESSED_TOPIC';

@Injectable()
export class FeedService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => ReactionService))
    private readonly reactionService: ReactionService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(POLL_PROVIDER)
    private readonly PollVoteModel: Model<PollModel>,
    @Inject(VOTE_PROVIDER)
    private readonly voteModel: Model<VoteModel>,
    @Inject(FEED_PROVIDER)
    private readonly feedModel: Model<FeedModel>,
    private readonly queueEventService: QueueEventService
  ) {
    this.queueEventService.subscribe(
      FEED_VIDEO_CHANNEL,
      FEED_FILE_PROCESSED_TOPIC,
      this.handleFileProcessed.bind(this)
    );
  }

  private async handleFileProcessed(event: QueueEvent) {
    const { eventName } = event;
    if (eventName !== FILE_EVENT.VIDEO_PROCESSED) {
      return false;
    }
    return false;
  }

  public async findById(id) {
    const data = await this.feedModel.findById(id);
    return data;
  }

  public async findByIds(ids, user, jwToken) {
    const data = await this.feedModel.find({ _id: { $in: ids } });
    const result = await this.populateFeedData(data as any, user, jwToken);
    return result;
  }

  public async handleCommentStat(feedId: string, num = 1) {
    await this.feedModel.updateOne({ _id: feedId }, { $inc: { totalComment: num } });
  }

  private async _validatePayload(payload: FeedCreatePayload) {
    if (!FEED_TYPES.includes(payload.type)) {
      throw new InvalidFeedTypeException();
    }
    // TODO - validate for other
  }

  private async populateFeedData(feeds: FeedModel[], user: UserDto, jwtToken) {
    const performerIds = uniq(
      feeds.map((f) => f.fromSourceId.toString())
    );
    const feedIds = feeds.map((f) => f._id);
    let pollIds = [];
    let fileIds = [];
    feeds.forEach((f) => {
      if (f.fileIds && f.fileIds.length) {
        fileIds = uniq(fileIds.concat(f.fileIds.concat([f?.thumbnailId || null, f?.teaserId || null])));
      }
      if (f.pollIds && f.pollIds.length) {
        pollIds = pollIds.concat(f.pollIds);
      }
    });
    const [performers, files, actions, subscriptions, orders, polls] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : [],
      user && user._id ? this.reactionService.findByQuery({ objectId: { $in: feedIds }, createdBy: user._id }) : [],
      user && user._id ? this.subscriptionService.findSubscriptionList({
        userId: user._id,
        performerId: { $in: performerIds },
        expiredAt: { $gt: new Date() },
        status: SUBSCRIPTION_STATUS.ACTIVE
      }) : [],
      user && user._id ? this.orderService.findOderDetailsByQuery({
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        status: ORDER_STATUS.PAID,
        buyerId: user._id,
        productType: PRODUCT_TYPE.SALE_POST,
        productId: { $in: feedIds }
      }) : [],
      pollIds.length ? this.PollVoteModel.find({ _id: { $in: pollIds } }) : []
    ]);

    return feeds.map((f) => {
      const feed = new FeedDto(f);
      const performer = performers.find((p) => p._id.toString() === f.fromSourceId.toString());
      if (performer) {
        feed.performer = new PerformerDto(performer).toPublicDetailsResponse();
      }
      const like = actions.find((l) => l.objectId.toString() === f._id.toString() && l.action === REACTION.LIKE);
      feed.isLiked = !!like;
      const bookmarked = actions.find((l) => l.objectId.toString() === f._id.toString() && l.action === REACTION.BOOK_MARK);
      feed.isBookMarked = !!bookmarked;
      const subscribed = subscriptions.find((s) => `${s.performerId}` === `${f.fromSourceId}`);
      feed.isSubscribed = !!((subscribed || (user && user._id && `${user._id}` === `${f.fromSourceId}`) || (user && user.roles && user.roles.includes('admin'))));
      const bought = orders.find((order) => `${order.productId}` === `${f._id}`);
      feed.isBought = !!((bought || (user && user._id && `${user._id}` === `${f.fromSourceId}`) || (user && user.roles && user.roles.includes('admin'))));
      const feedFileStringIds = (f.fileIds || []).map((fileId) => fileId.toString());
      const feedPollStringIds = (f.pollIds || []).map((pollId) => pollId.toString());
      feed.polls = polls.filter((p) => feedPollStringIds.includes(p._id.toString()));
      const feedFiles = files.filter((file) => feedFileStringIds.includes(file._id.toString()));
      if (feedFiles.length) {
        feed.files = feedFiles.map((file) => {
          let fileUrl = null;
          const canView = (feed.isSale && feed.isBought) || (!feed.isSale && feed.isSubscribed);
          if (canView) {
            fileUrl = file.getUrl();
          }
          if (canView && feed && jwtToken) {
            fileUrl = `${fileUrl}?feedId=${feed._id}&token=${jwtToken}`;
          }
          return {
            ...file.toResponse(),
            thumbnails: (file.thumbnails || []).map((thumb) => FileDto.getPublicUrl(thumb.path)),
            url: fileUrl
          };
        });
      }
      if (feed.thumbnailId) {
        const thumbnail = files.find((file) => file._id.toString() === feed.thumbnailId.toString());
        feed.thumbnailUrl = (thumbnail && FileDto.getPublicUrl(thumbnail.path)) || '';
      }
      if (feed.teaserId) {
        const teaser = files.find((file) => file._id.toString() === feed.teaserId.toString());
        feed.teaser = {
          ...teaser,
          url: teaser.getUrl()
        };
      }
      return feed;
    });
  }

  public async findOne(id, user, jwtToken): Promise<FeedDto> {
    const feed = await this.feedModel.findOne({ _id: id });
    if (!feed) {
      throw new EntityNotFoundException();
    }
    const newFeed = await this.populateFeedData([feed], user, jwtToken);
    return new FeedDto(newFeed[0]);
  }

  public async create(payload: FeedCreatePayload, user: UserDto): Promise<any> {
    // TODO - validate with the feed type?
    await this._validatePayload(payload);
    const fromSourceId = user.roles && user.roles.includes('admin') && payload.fromSourceId ? payload.fromSourceId : user._id;
    const performer = await this.performerService.findById(fromSourceId);
    if (!performer) throw new EntityNotFoundException();
    const feed = await this.feedModel.create({
      ...payload,
      orientation: performer.gender,
      fromSource: 'performer',
      fromSourceId
    } as any);
    if (feed.fileIds && feed.fileIds.length) {
      await Promise.all(feed.fileIds.map((fileId) => this.fileService.addRef((fileId as any), {
        itemId: feed._id,
        itemType: REF_TYPE.FEED
      })));
    }
    feed.teaserId && await this.fileService.addRef((feed.teaserId as any), {
      itemId: feed._id,
      itemType: REF_TYPE.FEED
    });
    feed.thumbnailId && await this.fileService.addRef((feed.thumbnailId as any), {
      itemId: feed._id,
      itemType: REF_TYPE.FEED
    });
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_FEED_CHANNEL,
        eventName: EVENT.CREATED,
        data: new FeedDto(feed)
      })
    );
    return feed;
  }

  public async search(req: FeedSearchRequest, user: UserDto, jwtToken) {
    const query = {
      fromSource: FEED_SOURCE.PERFORMER
    } as any;

    if (!user.roles || !user.roles.includes('admin')) {
      query.fromSourceId = user._id;
    }

    if (user.roles && user.roles.includes('admin') && req.performerId) {
      query.fromSourceId = req.performerId;
    }

    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gte: moment(req.fromDate).startOf('date'),
        $lte: moment(req.toDate).endOf('date')
      };
    }

    if (req.orientation) {
      query.orientation = req.orientation;
    }

    if (req.type) {
      query.type = req.type;
    }

    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      const searchValue = { $regex: regexp };
      query.$or = [
        { text: searchValue },
        { tagline: searchValue }
      ];
    }

    const sort = {
      updatedAt: -1
    };

    const [data, total] = await Promise.all([
      this.feedModel
        .find(query)
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.feedModel.countDocuments(query)
    ]);

    // populate video, photo, etc...
    return {
      data: await this.populateFeedData(data as any, user, jwtToken),
      total
    };
  }

  public async userSearchFeeds(req: FeedSearchRequest, user: UserDto, jwtToken) {
    const query = {
      fromSource: FEED_SOURCE.PERFORMER,
      status: STATUS.ACTIVE
    } as any;

    if (req.performerId) {
      query.fromSourceId = req.performerId;
    }
    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      const searchValue = { $regex: regexp };
      query.$or = [
        { text: searchValue },
        { tagline: searchValue }
      ];
      await this.queueEventService.publish(
        new QueueEvent({
          channel: SEARCH_CHANNEL,
          eventName: EVENT.CREATED,
          data: {
            keyword: req.q,
            fromSource: 'user',
            fromSourceId: user?._id || null
          }
        })
      );
    }
    if (req.orientation) {
      query.orientation = req.orientation;
    }
    if (req.type) {
      query.type = req.type;
    }
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gte: moment(req.fromDate).startOf('date'),
        $lte: moment(req.toDate).endOf('date')
      };
    }
    if (req.ids) {
      query._id = { $in: req.ids };
    }
    const sort = {
      updatedAt: -1
    };
    const [data, total] = await Promise.all([
      this.feedModel
        .find(query)
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.feedModel.countDocuments(query)
    ]);
    // populate video, photo, etc...
    return {
      data: await this.populateFeedData(data as any, user, jwtToken),
      total
    };
  }

  public async searchSubscribedPerformerFeeds(req: FeedSearchRequest, user: UserDto, jwtToken: string) {
    const query = {
      fromSource: FEED_SOURCE.PERFORMER,
      status: STATUS.ACTIVE
    } as any;

    const [subscriptions] = await Promise.all([
      user && !user.isPerformer ? this.subscriptionService.findSubscriptionList({
        userId: user._id,
        expiredAt: { $gt: new Date() },
        status: SUBSCRIPTION_STATUS.ACTIVE
      }) : []
    ]);
    const performerIds = subscriptions.map((s) => s.performerId);
    query.fromSourceId = { $in: performerIds };
    if (!user || (user && user.isPerformer) || (user && user.roles && user.roles.includes('admin'))) delete query.fromSourceId;
    if (req.q) {
      query.$or = [
        {
          text: { $regex: new RegExp(req.q, 'i') }
        }
      ];
    }
    if (req.type) {
      query.type = req.type;
    }
    if (req.orientation) {
      query.orientation = req.orientation;
    }
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gte: moment(req.fromDate).startOf('date'),
        $lte: moment(req.toDate).endOf('date')
      };
    }
    const sort = {
      updatedAt: -1
    };
    const [data, total] = await Promise.all([
      this.feedModel
        .find(query)
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.feedModel.countDocuments(query)
    ]);
    // populate video, photo, etc...
    return {
      data: await this.populateFeedData(data as any, user, jwtToken),
      total
    };
  }

  public async updateFeed(id: string, user: UserDto, payload: FeedCreatePayload): Promise<any> {
    const feed = await this.feedModel.findById(id);
    if (!feed || ((!user.roles || !user.roles.includes('admin')) && feed.fromSourceId.toString() !== user._id.toString())) throw new EntityNotFoundException();
    const data = { ...payload } as any;
    data.updatedAt = new Date();
    await this.feedModel.updateOne({ _id: id }, data);
    if (payload.fileIds && payload.fileIds.length) {
      const ids = feed.fileIds.map((_id) => _id.toString());
      const Ids = payload.fileIds.filter((_id) => !ids.includes(_id));
      Ids.forEach((fileId) => {
        this.fileService.addRef((fileId as any), {
          itemId: feed._id,
          itemType: REF_TYPE.FEED
        });
      });
    }
    return { updated: true };
  }

  public async deleteFeed(id, user) {
    const query = { _id: id, fromSourceId: user._id };
    if (user.roles && user.roles.includes('admin')) delete query.fromSourceId;

    const feed = await this.feedModel.findOne(query);
    if (!feed) {
      throw new EntityNotFoundException();
    }
    await this.feedModel.updateOne({ _id: id }, { status: feed.status === STATUS.INACTIVE ? STATUS.ACTIVE : STATUS.INACTIVE });
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_FEED_CHANNEL,
        eventName: feed.status === STATUS.INACTIVE ? EVENT.CREATED : EVENT.DELETED,
        data: new FeedDto(feed)
      })
    );
    return { success: true };
  }

  public async checkAuth(req: any, user: UserDto) {
    const { query } = req;
    if (!query.feedId) {
      throw new ForbiddenException();
    }
    if (user.roles && user.roles.indexOf('admin') > -1) {
      return true;
    }
    // check type video
    const feed = await this.feedModel.findById(query.feedId);
    if (!feed) throw new EntityNotFoundException();
    if (user._id.toString() === feed.fromSourceId.toString()) {
      return true;
    }
    if (!feed.isSale) {
      // check subscription
      const subscribed = await this.subscriptionService.checkSubscribed(
        feed.fromSourceId,
        user._id
      );
      if (!subscribed) {
        throw new ForbiddenException();
      }
      return true;
    } if (feed.isSale) {
      // check bought
      const bought = await this.orderService.findOneOderDetails({
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        status: ORDER_STATUS.PAID,
        buyerId: user._id,
        productType: PRODUCT_TYPE.SALE_POST,
        productId: feed._id
      });
      if (!bought) {
        throw new ForbiddenException();
      }
      return true;
    }
    throw new ForbiddenException();
  }

  public async createPoll(payload: PollCreatePayload, user: UserDto) {
    const poll = new this.PollVoteModel({
      ...payload,
      createdBy: user.roles && user.roles.includes('admin') && payload.performerId ? payload.performerId : user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await poll.save();
    return new PollDto(poll);
  }

  public async votePollFeed(pollId: string | ObjectId, user: UserDto): Promise<any> {
    const poll = await this.PollVoteModel.findById(pollId);
    if (!poll || !poll.refId) {
      throw new EntityNotFoundException();
    }
    if (new Date(poll.expiredAt) < new Date()) {
      throw new PollExpiredException();
    }
    const vote = await this.voteModel.findOne({
      targetSource: POLL_TARGET_SOURCE.FEED,
      refId: poll.refId,
      fromSourceId: user._id
    });

    if (vote) {
      throw new AlreadyVotedException();
    }

    const newVote = await this.voteModel.create({
      targetSource: POLL_TARGET_SOURCE.FEED,
      targetId: pollId,
      refId: poll.refId,
      fromSource: 'user',
      fromSourceId: user._id
    });
    await this.queueEventService.publish(
      new QueueEvent({
        channel: VOTE_FEED_CHANNEL,
        eventName: EVENT.CREATED,
        data: newVote
      })
    );

    return { voted: true };
  }
}
