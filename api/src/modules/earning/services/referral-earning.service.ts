import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { EntityNotFoundException, PageableData } from 'src/kernel';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import { uniq } from 'lodash';
import * as moment from 'moment';
import { ReferralEarningModel } from '../models';
import { REFERRAL_EARNING_MODEL_PROVIDER } from '../providers/earning.provider';
import {
  ReferralEarningSearchRequestPayload,
  UpdateEarningStatusPayload
} from '../payloads';
import { UserDto } from '../../user/dtos';
import { UserService } from '../../user/services';
import { PerformerService } from '../../performer/services';
import { ReferralEarningDto, IReferralEarningStatResponse } from '../dtos/referral-earning.dto';

@Injectable()
export class ReferralEarningService {
  constructor(
    @Inject(REFERRAL_EARNING_MODEL_PROVIDER)
    private readonly referralEarningModel: Model<ReferralEarningModel>,
    private readonly userService: UserService,
    private readonly performerService: PerformerService
  ) {}

  public async search(
    req: ReferralEarningSearchRequestPayload
  ): Promise<PageableData<ReferralEarningDto>> {
    const query = {} as any;
    if (req.referralId) {
      query.referralId = req.referralId;
    }
    if (req.registerId) {
      query.registerId = req.registerId;
    }
    if (req.sourceType) {
      query.sourceType = req.sourceType;
    }

    if (req.isPaid) {
      query.isPaid = req.isPaid === 'true';
    }

    const sort = {
      createdAt: -1
    } as any;

    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day').toDate(),
        $lt: moment(req.toDate).startOf('day').toDate()
      };
    }

    const [data, total] = await Promise.all([
      this.referralEarningModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.referralEarningModel.countDocuments(query)
    ]);
    const earnings = data.map((d) => new ReferralEarningDto(d));
    const registerIds = data.map((d) => d.registerId);
    const referralIds = data.map((d) => d.referralId);
    const Ids = uniq(registerIds.concat(referralIds));
    const [performers, users] = await Promise.all([
      this.performerService.findByIds(Ids) || [],
      this.userService.findByIds(Ids) || []
    ]);

    earnings.forEach((earning: ReferralEarningDto) => {
      const registerInfo = earning.registerSource === 'performer' ? performers.find((p) => `${p._id}` === `${earning.registerId}`) : users.find((p) => `${p._id}` === `${earning.registerId}`);
      // eslint-disable-next-line no-param-reassign
      earning.registerInfo = registerInfo ? new UserDto(registerInfo as any).toResponse() : null;
      const referralInfo = earning.referralSource === 'performer' ? performers.find((p) => `${p._id}` === `${earning.referralId}`) : users.find((p) => `${p._id}` === `${earning.referralId}`);
      // eslint-disable-next-line no-param-reassign
      earning.referralInfo = referralInfo ? new UserDto(referralInfo as any).toResponse() : null;
    });
    return {
      data: earnings,
      total
    };
  }

  public async details(id: string) {
    const earning = await this.referralEarningModel.findById(toObjectId(id));
    if (!earning) {
      throw new EntityNotFoundException();
    }
    const [users, performers] = await Promise.all([
      this.userService.findByIds([earning.referralId, earning.registerId]),
      this.performerService.findByIds([earning.referralId, earning.registerId])
    ]);
    const data = new ReferralEarningDto(earning);
    const registerInfo = earning.registerSource === 'performer' ? performers.find((p) => `${p._id}` === `${earning.registerId}`) : users.find((p) => `${p._id}` === `${earning.registerId}`);
    data.registerInfo = registerInfo ? new UserDto(registerInfo as any).toResponse() : null;
    const referralInfo = earning.referralSource === 'performer' ? performers.find((p) => `${p._id}` === `${earning.referralId}`) : users.find((p) => `${p._id}` === `${earning.referralId}`);
    data.referralInfo = referralInfo ? new UserDto(referralInfo as any).toResponse() : null;
    return data;
  }

  public async stats(
    req: ReferralEarningSearchRequestPayload
  ): Promise<IReferralEarningStatResponse> {
    const query = {} as any;
    if (req.registerId) {
      query.registerId = toObjectId(req.registerId);
    }
    if (req.referralId) {
      query.referralId = req.referralId;
    }
    if (req.sourceType) {
      query.sourceType = req.sourceType;
    }
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day').toDate(),
        $lt: moment(req.toDate).startOf('day').toDate()
      };
    }
    if (req.isPaid) {
      query.isPaid = req.isPaid === 'true';
    }
    const [totalGrossPrice, totalNetPrice, totalRemaining] = await Promise.all([
      this.referralEarningModel.aggregate<any>([
        {
          $match: query
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$grossPrice'
            }
          }
        }
      ]),
      this.referralEarningModel.aggregate<any>([
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
      this.referralEarningModel.aggregate<any>([
        {
          $match: { ...query, isPaid: false }
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
    const totalGross = (totalGrossPrice && totalGrossPrice.length && totalGrossPrice[0].total) || 0;
    const totalNet = (totalNetPrice && totalNetPrice.length && totalNetPrice[0].total) || 0;
    const totalRemain = (totalRemaining && totalRemaining.length && totalRemaining[0].total) || 0;
    const totalCommission = totalGross && totalNet ? (totalGross - totalNet) : 0;
    return {
      totalReferralGrossPrice: totalGross,
      totalReferralNetPrice: totalNet,
      totalReferralCommission: totalCommission,
      totalRemaining: totalRemain
    };
  }

  public async updatePaidStatus(
    payload: UpdateEarningStatusPayload
  ): Promise<any> {
    const query = { } as any;

    if (payload.fromDate && payload.toDate) {
      query.createdAt = {
        $gt: moment(payload.fromDate).startOf('day').toDate(),
        $lt: moment(payload.toDate).startOf('day').toDate()
      };
    }

    if (payload.referralId) {
      query.referralId = payload.referralId;
    }
    return this.referralEarningModel.updateMany(query, {
      $set: { isPaid: true, paidAt: new Date() }
    });
  }
}
