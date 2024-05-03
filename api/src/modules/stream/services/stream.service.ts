import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException,
  HttpException
} from '@nestjs/common';
import { PerformerService } from 'src/modules/performer/services';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException } from 'src/kernel';
import { v4 as uuidv4 } from 'uuid';
import { ConversationService } from 'src/modules/message/services';
import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { OrderService } from 'src/modules/payment/services';
import { ORDER_STATUS, PAYMENT_STATUS, PRODUCT_TYPE } from 'src/modules/payment/constants';
import { UserService } from 'src/modules/user/services';
import { RequestService } from './request.service';
import { SocketUserService } from '../../socket/services/socket-user.service';
import {
  PRIVATE_CHAT,
  PUBLIC_CHAT,
  defaultStreamValue,
  BroadcastType
} from '../constant';
import { Webhook, IStream, StreamDto } from '../dtos';
import { StreamModel } from '../models';
import { STREAM_MODEL_PROVIDER } from '../providers/stream.provider';
import {
  StreamOfflineException,
  StreamServerErrorException
} from '../exceptions';
import {
  PrivateCallRequestPayload, SetDurationPayload, SetPricePayload, TokenCreatePayload
} from '../payloads';

@Injectable()
export class StreamService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(STREAM_MODEL_PROVIDER)
    private readonly streamModel: Model<StreamModel>,
    private readonly conversationService: ConversationService,
    private readonly socketUserService: SocketUserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly requestService: RequestService
  ) {}

  public async findById(id: string | ObjectId): Promise<StreamModel> {
    const stream = await this.streamModel.findOne({ _id: id });
    if (!stream) {
      throw new EntityNotFoundException();
    }
    return stream;
  }

  public async findBySessionId(sessionId: string): Promise<StreamModel> {
    const stream = await this.streamModel.findOne({ sessionId });
    if (!stream) {
      throw new EntityNotFoundException();
    }

    return stream;
  }

  public async findByPerformerId(
    performerId: string | ObjectId,
    payload?: Partial<StreamDto>
  ): Promise<StreamModel> {
    const stream = await this.streamModel.findOne({ performerId, ...payload });
    return stream;
  }

  public async getSessionId(
    performerId: string | ObjectId,
    type: string
  ): Promise<string> {
    let stream = await this.streamModel.findOne({ performerId, type });
    if (!stream) {
      const data: IStream = {
        sessionId: uuidv4(),
        performerId,
        type
      };
      stream = await this.streamModel.create(data);
    }

    return stream.sessionId;
  }

  public async goLive(performer: PerformerDto) {
    let stream = await this.streamModel.findOne({
      performerId: performer._id,
      type: PUBLIC_CHAT
    });
    const sessionId = uuidv4();
    if (!stream) {
      const data: IStream = {
        sessionId,
        performerId: performer._id,
        type: PUBLIC_CHAT,
        price: performer.publicChatPrice
      };
      stream = await this.streamModel.create(data);
    }
    if (stream) {
      stream.sessionId = sessionId;
      stream.streamingTime = 0;
      await stream.save();
    }

    let conversation = await this.conversationService.findOne({
      type: `stream_${PUBLIC_CHAT}`,
      performerId: performer._id
    });
    if (!conversation) {
      conversation = await this.conversationService.createStreamConversation(
        new StreamDto(stream)
      );
    }

    const data = {
      ...defaultStreamValue,
      streamId: stream._id,
      name: stream._id,
      description: '',
      type: BroadcastType.LiveStream,
      status: 'finished'
    };

    const result = await this.requestService.create(data);
    if (result.status) {
      throw new StreamServerErrorException({
        message: result.data?.data?.message,
        error: result.data,
        status: result.data?.status
      });
    }

    return { conversation, sessionId: stream._id, price: stream.price };
  }

  public async joinPublicChat(performerId: string | ObjectId, user: UserDto) {
    const stream = await this.streamModel.findOne({
      performerId,
      type: PUBLIC_CHAT
    });
    if (!stream) {
      throw new EntityNotFoundException();
    }
    if (!stream.isStreaming) {
      throw new StreamOfflineException();
    }
    const subscribed = await this.subscriptionService.checkSubscribed(
      performerId,
      user._id
    );
    if (!subscribed) {
      throw new ForbiddenException();
    }
    // check bought on each session
    const bought = await this.orderService.findOneOderDetails({
      paymentStatus: PAYMENT_STATUS.SUCCESS,
      status: ORDER_STATUS.PAID,
      buyerId: user._id,
      productType: PRODUCT_TYPE.PUBLIC_CHAT,
      productId: stream._id,
      productSessionId: stream.sessionId
    });

    return {
      sessionId: stream._id, isBought: !!bought, price: stream.price, streamingTime: stream.streamingTime, isStreaming: stream.isStreaming
    };
  }

  public async requestPrivateChat(
    user: UserDto,
    payload: PrivateCallRequestPayload,
    performerId: string | ObjectId
  ) {
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }
    if (payload.price < performer.privateChatPrice) {
      throw new HttpException(`${performer.name} require minimum $${performer.privateChatPrice} to accept a call`, 422);
    }
    const subscribed = await this.subscriptionService.checkSubscribed(
      performerId,
      user._id
    );
    if (!subscribed) {
      throw new HttpException('You haven\'t subscribed this content creator yet', 403);
    }

    const data: IStream = {
      sessionId: uuidv4(),
      performerId,
      userIds: [user._id],
      type: PRIVATE_CHAT,
      isStreaming: true,
      price: payload.price
    };
    const stream = await this.streamModel.create(data);
    const recipients = [
      { source: 'performer', sourceId: new ObjectId(performerId) },
      { source: 'user', sourceId: user._id }
    ];
    const conversation = await this.conversationService.createStreamConversation(
      new StreamDto(stream),
      recipients
    );

    await this.socketUserService.emitToUsers(
      performerId.toString(),
      'private-chat-request',
      {
        user: user.toResponse(),
        streamId: stream._id,
        price: stream.price,
        conversationId: conversation._id,
        userNote: payload.userNote,
        createdAt: new Date()
      }
    );

    return {
      conversation, sessionId: stream.sessionId, price: stream.price, streamId: stream._id
    };
  }

  public async declinePrivateChat(
    convesationId: string,
    user: UserDto
  ) {
    const conversation = await this.conversationService.findById(convesationId);
    if (!conversation) throw new EntityNotFoundException();
    const recipient = conversation.recipients.find((r) => `${r.sourceId}` === `${user._id}`);
    if (!recipient) throw new ForbiddenException();
    const stream = conversation.streamId && await this.streamModel.findOne(conversation.streamId);
    if (!stream) throw new EntityNotFoundException();
    await Promise.all([
      stream.remove(),
      this.conversationService.deleteOne(conversation._id)
    ]);
    const userIds = conversation.recipients.map((r) => r.sourceId.toString());
    userIds.length && await this.socketUserService.emitToUsers(
      userIds,
      'private-chat-decline',
      {
        streamId: stream._id,
        conversationId: conversation._id
      }
    );
    return {
      declined: true
    };
  }

  public async acceptPrivateChat(id: string, performerId: ObjectId) {
    const conversation = await this.conversationService.findById(id);
    if (!conversation) {
      throw new EntityNotFoundException();
    }
    const recipent = conversation.recipients.find(
      (r) => r.sourceId.toString() !== performerId.toString()
        && r.source === 'user'
    );
    if (!recipent) {
      throw new EntityNotFoundException();
    }
    const user = await this.userService.findById(recipent.sourceId);
    if (!user) {
      throw new EntityNotFoundException();
    }
    const stream = await this.findById(conversation.streamId);

    if (!stream || `${stream.performerId}` !== `${performerId}`) {
      throw new EntityNotFoundException();
    }
    if (!stream.isStreaming) {
      throw new HttpException('Stream session ended', 422);
    }
    const returnData = {
      conversation,
      sessionId: stream.sessionId,
      price: stream.price,
      streamId: stream._id,
      isStreaming: stream.isStreaming,
      user: new UserDto(user).toResponse(),
      createdAt: new Date()
    };
    // fire event to user do payment
    await this.socketUserService.emitToRoom(`conversation-${conversation.type}-${conversation._id}`, 'private-chat-accept', returnData);
    return returnData;
  }

  public async webhook(
    sessionId: string,
    payload: Webhook
  ): Promise<StreamModel> {
    const stream = await this.streamModel.findOne({ sessionId });
    if (!stream) {
      return;
    }
    switch (payload.action) {
      case 'liveStreamStarted':
        if (stream.type === PUBLIC_CHAT) stream.isStreaming = true;
        break;
      case 'liveStreamEnded':
        if (stream.type === PUBLIC_CHAT) {
          stream.isStreaming = false;
          stream.lastStreamingTime = new Date();
        }
        break;
      default:
        break;
    }

    await stream.save();
  }

  public async getOneTimeToken(payload: TokenCreatePayload, userId: string) {
    const { id } = payload;
    let streamId = id;
    if (id.indexOf(PRIVATE_CHAT) === 0 || id.indexOf('group') === 0) {
      [, streamId] = id.split('-');
    }

    const [stream, conversation] = await Promise.all([
      this.streamModel.findOne({ _id: streamId }),
      this.conversationService.findOne({ streamId })
    ]);

    if (!stream || !conversation) {
      throw new EntityNotFoundException();
    }

    const { recipients } = conversation;
    const recipientIds = recipients.map((r) => r.sourceId.toString());
    if (!recipientIds.includes(userId)) {
      throw new ForbiddenException();
    }

    const resp = await this.requestService.generateOneTimeToken(id, payload);
    return resp.data;
  }

  public getRoomName(id: string | ObjectId, roomType: string) {
    return `conversation-${roomType}-${id}`;
  }

  public async setStreamPrice(payload: SetPricePayload, user: UserDto) {
    const { streamId, price } = payload;
    if (!streamId) throw new EntityNotFoundException();
    const stream = await this.streamModel.findById(streamId);
    if (!stream) throw new EntityNotFoundException();
    if (stream.type === PUBLIC_CHAT && `${stream.performerId}` !== `${user._id}`) throw new ForbiddenException();
    stream.price = price;
    await stream.save();
    const conversation = await this.conversationService.findOne({ streamId: stream._id });
    if (conversation) {
      await this.socketUserService.emitToRoom(`conversation-${conversation.type}-${conversation._id}`, 'change-stream-info', { stream: { price } });
    }
    return { price };
  }

  public async updateStreamDuration(payload: SetDurationPayload, user: UserDto) {
    const { streamId, duration } = payload;
    const stream = await this.streamModel.findById(streamId);
    if (!stream) {
      throw new EntityNotFoundException();
    }
    if (`${user._id}` !== `${stream.performerId}`) {
      throw new ForbiddenException();
    }
    if (stream.streamingTime >= duration) {
      return { updated: true };
    }
    stream.streamingTime = duration;
    await stream.save();
    return { updated: true };
  }
}
