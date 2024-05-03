import { Inject, Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { Model } from 'mongoose';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import {
  MEMBER_LIVE_STREAM_CHANNEL,
  MODEL_LIVE_STREAM_CHANNEL,
  LIVE_STREAM_EVENT_NAME
} from 'src/modules/stream/constant';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { STREAM_MODEL_PROVIDER } from '../providers/stream.provider';
import { StreamModel } from '../models';
import { StreamService } from '../services';

const USER_LIVE_STREAM_DISCONNECTED = 'USER_LIVE_STREAM_CONNECTED';
const MODEL_LIVE_STREAM_DISCONNECTED = 'MODEL_LIVE_STREAM_CONNECTED';

@Injectable()
export class StreamConnectListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly socketUserService: SocketUserService,
    private readonly streamService: StreamService,
    @Inject(STREAM_MODEL_PROVIDER)
    private readonly streamModel: Model<StreamModel>
  ) {
    this.queueEventService.subscribe(
      MEMBER_LIVE_STREAM_CHANNEL,
      USER_LIVE_STREAM_DISCONNECTED,
      this.userDisconnectHandler.bind(this)
    );
    this.queueEventService.subscribe(
      MODEL_LIVE_STREAM_CHANNEL,
      MODEL_LIVE_STREAM_DISCONNECTED,
      this.modelDisconnectHandler.bind(this)
    );
  }

  async userDisconnectHandler(event: QueueEvent) {
    if (event.eventName !== LIVE_STREAM_EVENT_NAME.DISCONNECTED) {
      return;
    }

    const sourceId = event.data;
    const user = await this.userService.findById(sourceId);
    if (!user) {
      return;
    }

    const connectedRedisRooms = await this.socketUserService.userGetAllConnectedRooms(
      sourceId
    );

    if (!connectedRedisRooms.length) {
      return;
    }

    await Promise.all(
      connectedRedisRooms.map((id) => this.socketUserService.removeConnectionFromRoom(id, sourceId))
    );

    const conversationIds = connectedRedisRooms.map((id) => this.deserializeConversationId(id));
    await Promise.all(
      connectedRedisRooms.map(
        (id, index) => conversationIds[index]
          && this.socketUserService.emitToRoom(
            id,
            `message_created_conversation_${conversationIds[index]}`,
            {
              text: `${user.username} has left this conversation`,
              _id: conversationIds[index],
              conversationId: conversationIds[index],
              isSystem: true
            }
          )
      )
    );
  }

  async modelDisconnectHandler(event: QueueEvent) {
    if (event.eventName !== LIVE_STREAM_EVENT_NAME.DISCONNECTED) {
      return;
    }

    const sourceId = event.data;
    const model = await this.performerService.findById(sourceId);
    if (!model) {
      return;
    }

    const connectedRedisRooms = await this.socketUserService.userGetAllConnectedRooms(
      sourceId
    );

    if (!connectedRedisRooms.length) {
      return;
    }

    await Promise.all(
      connectedRedisRooms.map((r) => this.socketUserService.removeConnectionFromRoom(r, sourceId))
    );
    /**
     * To do
     * Update status
     */
    await this.streamModel.updateMany(
      { isStreaming: true },
      { $set: { isStreaming: false, lastStreamingTime: new Date() } }
    );
  }

  deserializeConversationId(str: string) {
    const strs = str.split('-');
    if (!strs.length) return '';

    return strs[strs.length - 1];
  }
}
