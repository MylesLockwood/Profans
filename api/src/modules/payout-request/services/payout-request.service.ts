import {
  Injectable, Inject, ForbiddenException, forwardRef
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PerformerDto } from 'src/modules/performer/dtos';
import { PerformerService } from 'src/modules/performer/services';
import { MailerService } from 'src/modules/mailer';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import {
  EntityNotFoundException,
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { merge, uniq } from 'lodash';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import * as moment from 'moment';
import { REFERRAL_EARNING_MODEL_PROVIDER } from 'src/modules/earning/providers/earning.provider';
import { ReferralEarningModel } from 'src/modules/earning/models/referral-earning.model';
import { UserDto } from 'src/modules/user/dtos';
import { BankingSettingService, PaymentGatewaySettingService } from 'src/modules/payment/services';
import { UserService } from 'src/modules/user/services';
import {
  PAYOUT_REQUEST_CHANEL,
  PAYOUT_REQUEST_EVENT,
  SOURCE_TYPE,
  STATUSES
} from '../constants';
import { DuplicateRequestException } from '../exceptions';
import { PayoutRequestDto } from '../dtos/payout-request.dto';
import {
  PayoutRequestCreatePayload,
  PayoutRequestSearchPayload,
  PayoutRequestUpdatePayload,
  PayoutRequestPerformerUpdatePayload
} from '../payloads/payout-request.payload';
import { PayoutRequestModel } from '../models/payout-request.model';
import { PAYOUT_REQUEST_MODEL_PROVIDER } from '../providers/payout-request.provider';

@Injectable()
export class PayoutRequestService {
  constructor(
    @Inject(forwardRef(() => PaymentGatewaySettingService))
    private readonly paymentGatewaySettingService: PaymentGatewaySettingService,
    @Inject(forwardRef(() => BankingSettingService))
    private readonly bankingSettingService: BankingSettingService,
    @Inject(forwardRef(() => QueueEventService))
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => MailerService))
    private readonly mailService: MailerService,
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService,
    @Inject(REFERRAL_EARNING_MODEL_PROVIDER)
    private readonly referralEarningModel: Model<ReferralEarningModel>,
    @Inject(PAYOUT_REQUEST_MODEL_PROVIDER)
    private readonly payoutRequestModel: Model<PayoutRequestModel>
  ) { }

  public async search(
    req: PayoutRequestSearchPayload,
    user?: UserDto
  ): Promise<any> {
    const query = {} as any;
    if (req.sourceId) {
      query.sourceId = toObjectId(req.sourceId);
    }

    if (req.source) {
      query.source = req.source;
    }

    if (req.status) {
      query.status = req.status;
    }

    let sort = {
      updatedAt: -1
    } as any;

    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }

    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gte: moment(req.fromDate).startOf('day').toDate(),
        $lte: moment(req.toDate).endOf('day').toDate()
      };
    }

    const [data, total] = await Promise.all([
      this.payoutRequestModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.payoutRequestModel.countDocuments(query)
    ]);
    const requests = data.map((d) => new PayoutRequestDto(d));
    if (user?.roles?.includes('admin')) {
      const sourceIds = uniq(requests.map((r) => r.sourceId));
      const sources = await this.performerService.findByIds(sourceIds);
      requests.forEach((request: PayoutRequestDto) => {
        const sourceInfo = sources.find((s) => s && s._id.toString() === request.sourceId.toString());
        request.sourceInfo = sourceInfo && new PerformerDto(sourceInfo).toResponse();
      });
    }
    return {
      total,
      data: requests
    };
  }

  public async findById(id: string | object): Promise<any> {
    const request = await this.payoutRequestModel.findById(id);
    return request;
  }

  public async create(
    payload: PayoutRequestCreatePayload,
    user: UserDto
  ): Promise<PayoutRequestDto> {
    const data = {
      ...payload,
      sourceId: user._id,
      updatedAt: new Date(),
      createdAt: new Date()
    } as PayoutRequestModel;
    const query = {
      sourceId: user._id,
      source: payload.source,
      status: STATUSES.PENDING,
      createdAt: { $gte: moment().subtract(1, 'day').toDate() }
    };
    const request = await this.payoutRequestModel.findOne(query);
    if (request) {
      throw new DuplicateRequestException();
    }
    if (data.paymentAccountType === 'paypal') {
      const paymentSettings = await this.paymentGatewaySettingService.getPaymentSetting(data.sourceId, 'paypal');
      data.paymentAccountInfo = paymentSettings?.value;
    }
    if (data.paymentAccountType === 'banking') {
      data.paymentAccountInfo = await this.bankingSettingService.getBankingSetting(data.sourceId);
    }
    const resp = await this.payoutRequestModel.create(data);
    const adminEmail = (await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL)) || process.env.ADMIN_EMAIL;
    adminEmail && await this.mailService.send({
      subject: 'New payout request',
      to: adminEmail,
      data: {
        request: resp,
        requestName: user?.name || user?.username || 'N/A'
      },
      template: 'admin-payout-request'
    });
    return new PayoutRequestDto(resp);
  }

  public async calculate(
    user: UserDto,
    req: any
  ): Promise<any> {
    let sourceId = user._id;
    if (user.roles && user.roles.includes('admin') && req.sourceId) {
      sourceId = req.sourceId;
    }
    const query = {
      referralId: toObjectId(sourceId)
    } as any;
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day').toDate(),
        $lt: moment(req.toDate).endOf('day').toDate()
      };
    }
    const [totalEarnings, previousPaidOut] = await Promise.all([
      this.referralEarningModel.aggregate([
        {
          $match: query
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ]),
      this.referralEarningModel.aggregate([
        {
          $match: {
            referralId: toObjectId(sourceId),
            isPaid: true
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ])
    ]);

    return {
      totalEarnings: totalEarnings[0]?.total || 0,
      previousPaidOut: previousPaidOut[0]?.total || 0,
      remainingUnpaid: (totalEarnings[0]?.total || 0) - (previousPaidOut[0]?.total || 0)
    };
  }

  public async userUpdate(
    id: string,
    payload: PayoutRequestPerformerUpdatePayload,
    performer: UserDto
  ): Promise<PayoutRequestDto> {
    const payout = await this.payoutRequestModel.findOne({ _id: id });
    if (!payout) {
      throw new EntityNotFoundException();
    }
    if (performer._id.toString() !== payout.sourceId.toString()) {
      throw new ForbiddenException();
    }
    merge(payout, payload);
    if (payout.paymentAccountType === 'paypal') {
      const paymentSettings = await this.paymentGatewaySettingService.getPaymentSetting(payout.sourceId, 'paypal');
      payout.paymentAccountInfo = paymentSettings?.value;
    }
    if (payout.paymentAccountType === 'banking') {
      payout.paymentAccountInfo = await this.bankingSettingService.getBankingSetting(payout.sourceId);
    }
    await payout.save();
    // const adminEmail = (await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL)) || process.env.ADMIN_EMAIL;
    // adminEmail && await this.mailService.send({
    //   subject: 'New payout request',
    //   to: adminEmail,
    //   data: {
    //     request: payout,
    //     performer
    //   },
    //   template: 'admin-payout-request'
    // });
    return new PayoutRequestDto(payout);
  }

  public async details(id: string, user: UserDto) {
    const payout = await this.payoutRequestModel.findById(id);
    if (!payout) {
      throw new EntityNotFoundException();
    }

    if (user._id.toString() !== payout.sourceId.toString()) {
      throw new ForbiddenException();
    }

    const data = new PayoutRequestDto(payout);
    data.sourceInfo = new PerformerDto(user).toSearchResponse() || null;
    return data;
  }

  public async adminDetails(id: string) {
    const payout = await this.payoutRequestModel.findById(id);
    if (!payout) {
      throw new EntityNotFoundException();
    }
    const data = new PayoutRequestDto(payout);
    const { sourceId, source } = data;
    if (source === SOURCE_TYPE.PERFORMER) {
      const sourceInfo = await this.performerService.findById(sourceId);
      if (sourceInfo) {
        data.sourceInfo = new PerformerDto(sourceInfo).toResponse();
      }
    }
    if (source === SOURCE_TYPE.USER) {
      const sourceInfo = await this.userService.findById(sourceId);
      if (sourceInfo) {
        data.sourceInfo = new UserDto(sourceInfo).toResponse();
      }
    }
    return data;
  }

  public async adminDelete(id: string) {
    const payout = await this.payoutRequestModel.findById(id);
    if (!payout) {
      throw new EntityNotFoundException();
    }
    if ([STATUSES.DONE, STATUSES.REJECTED].includes(payout.status)) {
      throw new ForbiddenException();
    }
    await payout.remove();
    return { deleted: true };
  }

  public async adminUpdate(
    id: string | ObjectId,
    payload: PayoutRequestUpdatePayload
  ): Promise<any> {
    const request = await this.payoutRequestModel.findById(id);
    if (!request) {
      throw new EntityNotFoundException();
    }

    const oldStatus = request.status;
    merge(request, payload);
    request.updatedAt = new Date();
    await request.save();

    const event: QueueEvent = {
      channel: PAYOUT_REQUEST_CHANEL,
      eventName: PAYOUT_REQUEST_EVENT.UPDATED,
      data: {
        request,
        oldStatus
      }
    };
    await this.queueEventService.publish(event);
    return request;
  }
}
