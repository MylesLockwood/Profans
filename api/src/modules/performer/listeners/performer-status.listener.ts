import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { PERFORMER_UPDATE_STATUS_CHANNEL, PERFORMER_STATUSES } from 'src/modules/performer/constants';
import { EVENT } from 'src/kernel/constants';
import { MailerService } from 'src/modules/mailer/services';

const PERFORMER_STATUS_TOPIC = 'PERFORMER_STATUS_TOPIC';

@Injectable()
export class UpdatePerformerStatusListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => MailerService))
    private readonly mailService: MailerService
  ) {
    this.queueEventService.subscribe(
      PERFORMER_UPDATE_STATUS_CHANNEL,
      PERFORMER_STATUS_TOPIC,
      this.handleUpdateStatus.bind(this)
    );
  }

  public async handleUpdateStatus(event: QueueEvent) {
    if (![EVENT.UPDATED].includes(event.eventName)) {
      return false;
    }
    const {
      oldStatus, status, email, name
    } = event.data;
    if (oldStatus === PERFORMER_STATUSES.ACTIVE) {
      return false;
    }
    if (email && status === PERFORMER_STATUSES.ACTIVE) {
      await this.mailService.send({
        subject: 'Account approval',
        to: email,
        data: { name },
        template: 'approved-performer-account.html'
      });
    }
    return true;
  }
}
