import { Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { MESSAGE_PRIVATE_STREAM_CHANNEL, MESSAGE_EVENT } from 'src/modules/message/constants';
import { MessageDto } from 'src/modules/message/dtos';
import { ConversationService } from 'src/modules/message/services';
import { StreamService } from '../services';

const MESSAGE_STREAM_NOTIFY = 'MESSAGE_STREAM_NOTIFY';

@Injectable()
export class StreamMessageListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService,
    private readonly conversationService: ConversationService,
    private readonly streamService: StreamService
  ) {
    this.queueEventService.subscribe(
      MESSAGE_PRIVATE_STREAM_CHANNEL,
      MESSAGE_STREAM_NOTIFY,
      this.handleMessage.bind(this)
    );
  }

  private async handleMessage(event: QueueEvent): Promise<void> {
    if (![MESSAGE_EVENT.CREATED, MESSAGE_EVENT.DELETED].includes(event.eventName)) return;
    const message = event.data as MessageDto;

    const conversation = await this.conversationService.findById(message.conversationId);
    if (!conversation) return;
    if (event.eventName === MESSAGE_EVENT.CREATED) {
      await this.handleNotify(conversation, message);
    }
    if (event.eventName === MESSAGE_EVENT.DELETED) {
      await this.handleNotifyDelete(conversation, message);
    }
  }

  private async handleNotify(conversation, message): Promise<void> {
    const roomName = this.streamService.getRoomName(conversation._id, conversation.type);
    await this.socketUserService.emitToRoom(roomName, `message_created_conversation_${conversation._id}`, message);
  }

  private async handleNotifyDelete(conversation, message): Promise<void> {
    const roomName = this.streamService.getRoomName(conversation._id, conversation.type);
    await this.socketUserService.emitToRoom(roomName, `message_deleted_conversation_${conversation._id}`, message);
  }
}
