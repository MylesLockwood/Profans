import { Injectable, Inject } from '@nestjs/common';
import { QueueEvent, QueueEventService, StringHelper } from 'src/kernel';
import { Model } from 'mongoose';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { ObjectId } from 'mongodb';
import { MESSAGE_CHANNEL, MESSAGE_EVENT } from '../constants';
import { MessageDto } from '../dtos';
import { CONVERSATION_MODEL_PROVIDER, NOTIFICATION_MESSAGE_MODEL_PROVIDER } from '../providers';
import { ConversationModel, NotificationMessageModel } from '../models';

const MESSAGE_NOTIFY = 'MESSAGE_NOTIFY';

@Injectable()
export class MessageListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService,
    @Inject(CONVERSATION_MODEL_PROVIDER)
    private readonly conversationModel: Model<ConversationModel>,
    @Inject(NOTIFICATION_MESSAGE_MODEL_PROVIDER)
    private readonly notificationMessageModel: Model<NotificationMessageModel>
  ) {
    this.queueEventService.subscribe(
      MESSAGE_CHANNEL,
      MESSAGE_NOTIFY,
      this.handleMessage.bind(this)
    );
  }

  private async handleMessage(event: QueueEvent): Promise<void> {
    if (event.eventName !== MESSAGE_EVENT.CREATED) return;
    const message = event.data as MessageDto;

    const conversation = await this.conversationModel
      .findOne({ _id: message.conversationId })
      .lean()
      .exec();
    if (!conversation) return;
    const receiverIds = (conversation.recipients || [])
      .map((r) => r.sourceId)
      .filter((r) => r.toString() !== message.senderId.toString());
    await this.updateNotification(conversation, receiverIds, 1);
    await this.handleNotify(receiverIds, message);
    await this.updateLastMessage(conversation, message);
  }

  private async updateLastMessage(conversation, message: MessageDto): Promise<void> {
    const lastMessage = StringHelper.truncate(message.text || '', 30);
    const lastSenderId = message.senderId;
    const lastMessageCreatedAt = message.createdAt;
    await this.conversationModel.updateOne({ _id: conversation._id }, {
      $set: {
        lastMessage,
        lastSenderId,
        lastMessageCreatedAt
      }
    });
  }

  // eslint-disable-next-line consistent-return
  private async updateNotification(conversation, receiverIds, num = 1): Promise<void> {
    const availableData = await this.notificationMessageModel.find({
      conversationId: conversation._id,
      recipientId: { $in: receiverIds }
    });
    if (availableData && availableData.length) {
      const Ids = availableData.map((a) => a._id);
      await this.notificationMessageModel.updateMany({ _id: { $in: Ids } }, {
        $inc: { totalNotReadMessage: num }, updatedAt: new Date()
      });
      await Promise.all(receiverIds.map(async (receiverId) => {
        const totalNotReadMessage = await this.notificationMessageModel.aggregate([
          {
            $match: { recipientId: receiverId }
          },
          {
            $group: {
              _id: '$conversationId',
              total: {
                $sum: '$totalNotReadMessage'
              }
            }
          }
        ]);
        let total = 0;
        totalNotReadMessage && totalNotReadMessage.length && totalNotReadMessage.forEach((data) => {
          if (data.total) {
            total += 1;
          }
        });
        await this.notifyCountingNotReadMessageInConversation(receiverId, total);
      }));
      return;
    }
    await Promise.all(receiverIds.map(async (rId) => {
      // eslint-disable-next-line new-cap
      await new this.notificationMessageModel({
        conversationId: conversation._id,
        recipientId: rId,
        totalNotReadMessage: num,
        updatedAt: new Date(),
        createdAt: new Date()
      }).save();
      const totalNotReadMessage = await this.notificationMessageModel.aggregate([
        {
          $match: { recipientId: rId }
        },
        {
          $group: {
            _id: '$conversationId',
            total: {
              $sum: '$totalNotReadMessage'
            }
          }
        }
      ]);
      let total = 0;
      totalNotReadMessage && totalNotReadMessage.length && totalNotReadMessage.forEach((data) => {
        if (data.total) {
          total += 1;
        }
      });
      await this.notifyCountingNotReadMessageInConversation(rId, total);
    }));
  }

  private async notifyCountingNotReadMessageInConversation(receiverId, total): Promise<void> {
    await this.socketUserService.emitToUsers(new ObjectId(receiverId), 'nofify_read_messages_in_conversation', { total });
  }

  private async handleNotify(receiverIds, message): Promise<void> {
    await this.socketUserService.emitToUsers(receiverIds, 'message_created', message);
  }
}
