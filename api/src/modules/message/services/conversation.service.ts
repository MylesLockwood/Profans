import {
  Injectable, Inject, forwardRef, ForbiddenException
} from '@nestjs/common';
import { EntityNotFoundException } from 'src/kernel';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import { UserSearchService, UserService } from 'src/modules/user/services';
import { PerformerService, PerformerSearchService } from 'src/modules/performer/services';
import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { SUBSCRIPTION_STATUS } from 'src/modules/subscription/constants';
import { StreamDto } from 'src/modules/stream/dtos';
import { PerformerSearchPayload } from 'src/modules/performer/payloads';
import { UserSearchRequestPayload } from 'src/modules/user/payloads';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { ConversationSearchPayload, ConversationUpdatePayload } from '../payloads';
import { ConversationDto } from '../dtos';
import { CONVERSATION_TYPE } from '../constants';
import { ConversationModel, NotificationMessageModel } from '../models';
import {
  CONVERSATION_MODEL_PROVIDER,
  NOTIFICATION_MESSAGE_MODEL_PROVIDER
} from '../providers';

export interface IRecipient {
  source: string;
  sourceId: ObjectId;
}

@Injectable()
export class ConversationService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => UserSearchService))
    private readonly userSearchService: UserSearchService,
    @Inject(forwardRef(() => PerformerSearchService))
    private readonly performerSearchService: PerformerSearchService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    @Inject(CONVERSATION_MODEL_PROVIDER)
    private readonly conversationModel: Model<ConversationModel>,
    private readonly socketService: SocketUserService,
    @Inject(NOTIFICATION_MESSAGE_MODEL_PROVIDER)
    private readonly notiticationMessageModel: Model<NotificationMessageModel>
  ) {}

  public async findOne(params): Promise<ConversationModel> {
    return this.conversationModel.findOne(params);
  }

  public async deleteOne(id: string | ObjectId): Promise<any> {
    return this.conversationModel.deleteOne({ _id: id });
  }

  public async createStreamConversation(stream: StreamDto, recipients?: any) {
    return this.conversationModel.create({
      streamId: stream._id,
      performerId: stream.performerId && toObjectId(stream.performerId),
      recipients: recipients || [],
      name: `${stream.type} stream session ${stream.sessionId}`,
      type: `stream_${stream.type}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  public async createPrivateConversation(
    sender: IRecipient,
    receiver: IRecipient
  ): Promise<ConversationDto> {
    let conversation = await this.conversationModel
      .findOne({
        type: CONVERSATION_TYPE.PRIVATE,
        recipients: {
          $all: [
            {
              source: sender.source,
              sourceId: toObjectId(sender.sourceId)
            },
            {
              source: receiver.source,
              sourceId: receiver.sourceId
            }
          ]
        }
      })
      .lean()
      .exec();
    if (!conversation) {
      conversation = await this.conversationModel.create({
        type: CONVERSATION_TYPE.PRIVATE,
        recipients: [sender, receiver],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // TODO - define DTO?
    const dto = new ConversationDto(conversation);
    dto.totalNotSeenMessages = 0;
    if (receiver.source === 'performer') {
      const per = await this.performerService.findById(receiver.sourceId);
      if (per) {
        dto.recipientInfo = new PerformerDto(per).toResponse(false);
        const subscribed = await this.subscriptionService.checkSubscribed(
          per._id,
          sender.sourceId
        );
        dto.isSubscribed = !!subscribed;
      }
    }
    if (receiver.source === 'user') {
      dto.isSubscribed = true;
      const user = await this.userService.findById(receiver.sourceId);
      if (user) dto.recipientInfo = new UserDto(user).toResponse(false);
    }
    return dto;
  }

  public async updateConversationName(id: string, user: UserDto, payload: ConversationUpdatePayload) {
    const conversation = await this.conversationModel.findById(id);
    if (!conversation) throw new EntityNotFoundException();
    if (`${conversation.performerId}` !== `${user._id}`) throw new ForbiddenException();
    conversation.name = payload.name;
    await conversation.save();
    if (conversation.streamId) {
      await this.socketService.emitToRoom(`conversation-${conversation.type}-${conversation._id}`, 'change-stream-info', { conversation });
    }
    return conversation;
  }

  public async getList(
    req: ConversationSearchPayload,
    sender: IRecipient
  ): Promise<any> {
    let query = {
      recipients: {
        $elemMatch: {
          source: sender.source,
          sourceId: toObjectId(sender.sourceId)
        }
      }
    } as any;
    // must be the first
    if (req.keyword) {
      let usersSearch = null;
      if (sender.source === 'user') {
        usersSearch = await this.performerSearchService.searchByKeyword({ q: req.keyword } as PerformerSearchPayload);
      }
      if (sender.source === 'performer') {
        usersSearch = await this.userSearchService.searchByKeyword({ q: req.keyword } as UserSearchRequestPayload);
      }
      const Ids = usersSearch ? usersSearch.map((u) => u._id) : [];
      query = {
        $and: [{
          recipients: {
            $elemMatch: {
              source: sender.source === 'user' ? 'performer' : 'user',
              sourceId: { $in: Ids }
            }
          }
        },
        {
          recipients: {
            $elemMatch: {
              source: sender.source,
              sourceId: toObjectId(sender.sourceId)
            }
          }
        }]
      };
    }

    if (req.type) {
      query.type = req.type;
    }

    const [data, total] = await Promise.all([
      this.conversationModel
        .find(query)
        .lean()
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10))
        .sort({ lastMessageCreatedAt: -1, updatedAt: -1 }),
      this.conversationModel.countDocuments(query)
    ]);

    // find recipient info
    const conversations = data.map((d) => new ConversationDto(d));
    const recipientIds = conversations.map((c) => {
      const re = c.recipients.find(
        (rep) => rep.sourceId.toString() !== sender.sourceId.toString()
      );
      if (re) {
        return re.sourceId;
      }
      return undefined;
    });
    const conversationIds = data.map((d) => d._id);
    let users = [];
    let performers = [];
    let subscriptions = [];
    const notifications = conversationIds.length
      ? await this.notiticationMessageModel.find({
        conversationId: { $in: conversationIds }
      })
      : [];
    if (sender.source === 'user') {
      performers = recipientIds.length
        ? await this.performerService.findByIds(recipientIds)
        : [];
      if (performers.length) {
        const pIds = performers.map((p) => p._id);
        subscriptions = await this.subscriptionService.findSubscriptionList({
          performerId: { $in: pIds },
          userId: sender.sourceId,
          expiredAt: { $gt: new Date() },
          status: SUBSCRIPTION_STATUS.ACTIVE
        });
      }
    }
    if (sender.source === 'performer') {
      users = recipientIds.length
        ? await this.userService.findByIds(recipientIds)
        : [];
    }

    conversations.forEach((conversation: ConversationDto) => {
      const recipient = conversation.recipients.find(
        (rep) => rep.sourceId.toString() !== sender.sourceId.toString()
      );
      let recipientInfo = null;
      if (recipient) {
        // eslint-disable-next-line no-param-reassign
        conversation.isSubscribed = sender.source === 'performer';
        if (users.length) {
          recipientInfo = users.find(
            (u) => u._id.toString() === recipient.sourceId.toString()
          );
        }
        if (performers.length) {
          recipientInfo = performers.find(
            (p) => p._id.toString() === recipient.sourceId.toString()
          );
        }
        if (recipientInfo) {
          // eslint-disable-next-line no-param-reassign
          conversation.recipientInfo = new UserDto(recipientInfo).toResponse(
            false
          );
          if (subscriptions.length && sender.source === 'user') {
            const subscribed = subscriptions.filter(
              (sub) => sub.performerId.toString() === recipient.sourceId.toString()
                && sub.userId.toString() === sender.sourceId.toString()
            );
            if (subscribed.length) {
              // eslint-disable-next-line no-param-reassign
              conversation.isSubscribed = true;
            }
          }
        }
        // eslint-disable-next-line no-param-reassign
        conversation.totalNotSeenMessages = 0;
        if (notifications.length) {
          const conversationNotifications = notifications.filter(
            (noti) => noti.conversationId.toString() === conversation._id.toString()
          );
          if (conversationNotifications) {
            const recipientNoti = conversationNotifications.find(
              (c) => c.recipientId.toString() === sender.sourceId.toString()
            );
            // eslint-disable-next-line no-param-reassign
            conversation.totalNotSeenMessages = recipientNoti
              ? recipientNoti.totalNotReadMessage
              : 0;
          }
        }
      }
    });

    return {
      data: conversations,
      total
    };
  }

  public async findById(id: string | ObjectId) {
    const conversation = await this.conversationModel.findById(id);
    return conversation;
  }

  public async findPerformerPublicConversation(performerId: string | ObjectId) {
    const data = await this.conversationModel
      .findOne({
        type: `stream_${CONVERSATION_TYPE.PUBLIC}`,
        performerId
      })
      .lean()
      .exec();
    return data;
  }

  public async getPrivateConversationByStreamId(streamId: string | ObjectId) {
    const conversation = await this.conversationModel.findOne({ streamId });
    if (!conversation) {
      throw new EntityNotFoundException();
    }
    return new ConversationDto(conversation);
  }

  public async addRecipient(
    conversationId: string | ObjectId,
    recipient: IRecipient
  ) {
    return this.conversationModel.updateOne({ _id: conversationId }, { $addToSet: { recipients: recipient } });
  }
}
