import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { PerformerService } from 'src/modules/performer/services';
import { MailerService } from 'src/modules/mailer';
import { UserService } from 'src/modules/user/services';
import { REFERRAL_EARNING_MODEL_PROVIDER } from 'src/modules/earning/providers/earning.provider';
import { ReferralEarningModel } from 'src/modules/earning/models';
import { Model } from 'mongoose';
import * as moment from 'moment';
import {
  PAYOUT_REQUEST_CHANEL,
  PAYOUT_REQUEST_EVENT,
  STATUSES
} from '../constants';

const PAYOUT_REQUEST_UPDATE = 'PAYOUT_REQUEST_UPDATE';

@Injectable()
export class UpdatePayoutRequestListener {
  constructor(
    @Inject(REFERRAL_EARNING_MODEL_PROVIDER)
    private readonly referralEarningModel: Model<ReferralEarningModel>,
    @Inject(forwardRef(() => QueueEventService))
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => MailerService))
    private readonly mailService: MailerService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {
    this.queueEventService.subscribe(
      PAYOUT_REQUEST_CHANEL,
      PAYOUT_REQUEST_UPDATE,
      this.handler.bind(this)
    );
  }

  async handler(event: QueueEvent) {
    const { request } = event.data;
    if (event.eventName === PAYOUT_REQUEST_EVENT.UPDATED) {
      const {
        status, sourceId, source, oldStatus, fromDate, toDate
      } = request;
      let sourceInfo = null;
      if (source === 'performer') {
        sourceInfo = await this.performerService.findById(sourceId);
      }
      if (source === 'user') {
        sourceInfo = await this.userService.findById(sourceId);
      }
      if (!sourceInfo) {
        return;
      }
      if (status === STATUSES.DONE && oldStatus === STATUSES.PENDING) {
        await this.referralEarningModel.updateMany({
          createdAt: {
            $gt: moment(fromDate).startOf('day').toDate(),
            $lt: moment(toDate).endOf('day').toDate()
          }
        }, {
          isPaid: true,
          paidAt: new Date()
        });
      }
      if (sourceInfo.email && status !== oldStatus) {
        await this.mailService.send({
          subject: 'Update payout request',
          to: sourceInfo.email,
          data: { request },
          template: 'payout-request'
        });
      }
    }
  }
}
