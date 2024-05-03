import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import {
  ORDER_PAID_SUCCESS_CHANNEL,
  PAYMENT_TYPE
} from 'src/modules/payment/constants';
import { EVENT } from 'src/kernel/constants';
import { ConversationService } from 'src/modules/message/services';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { PAYMENT_STATUS } from '../../payment/constants';

const HANDLE_PAYMENT_PRIVATE_CHAT = 'HANDLE_PAYMENT_PRIVATE_CHAT';

@Injectable()
export class PrivateChatPaymentListener {
  constructor(
    @Inject(forwardRef(() => ConversationService))
    private readonly conversationService: ConversationService,
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService
  ) {
    this.queueEventService.subscribe(
      ORDER_PAID_SUCCESS_CHANNEL,
      HANDLE_PAYMENT_PRIVATE_CHAT,
      this.handleNofifyPerformer.bind(this)
    );
  }

  public async handleNofifyPerformer(
    event: QueueEvent
  ) {
    if (event.eventName !== EVENT.CREATED) {
      return;
    }
    const { orderDetails, transaction } = event.data;
    if (transaction?.status !== PAYMENT_STATUS.SUCCESS || transaction?.type !== PAYMENT_TYPE.PRIVATE_CHAT) {
      return;
    }
    const conversation = await this.conversationService.findOne({
      streamId: orderDetails[0].productId
    });
    if (!conversation) return;
    await this.socketUserService.emitToRoom(`conversation-${conversation.type}-${conversation._id}`, 'private-chat-payment-success', {
      conversation
    });
  }
}
