import { Injectable, Inject } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { Model } from 'mongoose';
import { DELETE_USER_CHANNEL } from 'src/modules/user/constants';
import { EVENT } from 'src/kernel/constants';
import { UserDto } from 'src/modules/user/dtos';
import { FileService } from 'src/modules/file/services';
import { DELETE_PERFORMER_CHANNEL } from 'src/modules/performer/constants';
import { ConversationModel, MessageModel, NotificationMessageModel } from '../models';
import { CONVERSATION_MODEL_PROVIDER, NOTIFICATION_MESSAGE_MODEL_PROVIDER, MESSAGE_MODEL_PROVIDER } from '../providers';
import { CONVERSATION_TYPE } from '../constants';

const DELETE_USER_MESSAGE_TOPIC = 'DELETE_USER_MESSAGE_TOPIC';
const DELETE_PERFORMER_MESSAGE_TOPIC = 'DELETE_PERFORMER_MESSAGE_TOPIC';

@Injectable()
export class DeleteUserMessageListener {
  constructor(
    private readonly fileService: FileService,
    private readonly queueEventService: QueueEventService,
    @Inject(MESSAGE_MODEL_PROVIDER)
    private readonly messageModel: Model<MessageModel>,
    @Inject(CONVERSATION_MODEL_PROVIDER)
    private readonly conversationModel: Model<ConversationModel>,
    @Inject(NOTIFICATION_MESSAGE_MODEL_PROVIDER)
    private readonly notificationMessageModel: Model<NotificationMessageModel>
  ) {
    this.queueEventService.subscribe(
      DELETE_USER_CHANNEL,
      DELETE_USER_MESSAGE_TOPIC,
      this.handleDeleteData.bind(this)
    );
    this.queueEventService.subscribe(
      DELETE_PERFORMER_CHANNEL,
      DELETE_PERFORMER_MESSAGE_TOPIC,
      this.handleDeleteData.bind(this)
    );
  }

  private async handleDeleteData(event: QueueEvent): Promise<void> {
    if (event.eventName !== EVENT.DELETED) return;
    const user = event.data as UserDto;
    try {
      const conversations = await this.conversationModel.find({
        recipients: {
          $elemMatch: {
            sourceId: user._id
          }
        },
        type: CONVERSATION_TYPE.PRIVATE
      });
      const conversationIds = conversations.map((c) => c._id);
      const messages = await this.messageModel.find({
        senderId: user._id,
        type: 'photo'
      });
      const messageIds = messages.map((c) => c._id);
      await Promise.all([
        this.notificationMessageModel.deleteMany({
          recipientId: user._id
        }),
        this.conversationModel.deleteMany({
          _id: conversationIds
        }),
        this.messageModel.deleteMany({
          senderId: user._id
        }),
        this.fileService.deleteManyByRefIds(messageIds)
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
