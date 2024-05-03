import {
  Injectable,
  Inject,
  ForbiddenException
} from '@nestjs/common';
import { Model } from 'mongoose';
import {
  EntityNotFoundException, PageableData
} from 'src/kernel';
import * as moment from 'moment';
import { CountryService } from 'src/modules/utils/services';
import { uniq } from 'lodash';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerService } from 'src/modules/performer/services';
import { UserService } from 'src/modules/user/services';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { ReferralReportDto } from '../dtos';
import {
  ReferralReportModel
} from '../models';
import {
  REFERRAL_REPORT_PROVIDER
} from '../providers';
import { ReferralReportSearchPayload } from '../payloads';

@Injectable()
export class ReferralReportService {
  constructor(
    @Inject(REFERRAL_REPORT_PROVIDER)
    private readonly referralReportModel: Model<ReferralReportModel>,
    private readonly countryService: CountryService,
    private readonly performerService: PerformerService,
    private readonly userService: UserService,
    private readonly settingService: SettingService
  ) { }

  public async findOne(query: any) {
    return this.referralReportModel.findOne(query);
  }

  public async find(query: any) {
    return this.referralReportModel.find(query);
  }

  public async search(
    req: ReferralReportSearchPayload
  ): Promise<PageableData<ReferralReportDto>> {
    const query = {
    } as any;
    if (req.referralId) {
      query.referralId = req.referralId;
    }
    if (req.registerId) {
      query.registerId = req.registerId;
    }
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gte: moment(req.fromDate).startOf('day').toDate(),
        $lte: moment(req.toDate).endOf('day').toDate()
      };
    }
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.referralReportModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.referralReportModel.countDocuments(query)
    ]);
    const referralIds = data.map((d) => d.referralId);
    const registerIds = data.map((d) => d.registerId);
    const Ids = uniq(referralIds.concat(registerIds));
    const performers = await this.performerService.findByIds(Ids);
    const users = await this.userService.findByIds(Ids);
    return {
      data: data.map((d) => {
        const resp = new ReferralReportDto(d);
        const referralInfo = d.referralSource === 'performer' ? performers.find((p) => `${p._id}` === `${resp.referralId}`) : users.find((p) => `${p._id}` === `${resp.referralId}`);
        const registerInfo = d.registerSource === 'performer' ? performers.find((p) => `${p._id}` === `${resp.registerId}`) : users.find((p) => `${p._id}` === `${resp.registerId}`);
        resp.referralInfo = referralInfo ? new UserDto(referralInfo as any).toResponse() : null;
        resp.registerInfo = registerInfo ? new UserDto(registerInfo as any).toResponse() : null;
        return resp;
      }),
      total
    };
  }

  public async getDetails(id: string, user: UserDto) {
    const report = await this.referralReportModel.findById(id);
    if (!report) {
      throw new EntityNotFoundException();
    }
    if (user.roles && !user.roles.includes('admin') && `${user._id}` !== `${report.referralId}`) {
      throw new ForbiddenException();
    }

    const performers = await this.performerService.findByIds([report.referralId, report.registerId]);
    const users = await this.userService.findByIds([report.referralId, report.registerId]);
    const resp = new ReferralReportDto(report);
    const referralInfo = report.referralSource === 'performer' ? performers.find((p) => `${p._id}` === `${resp.referralId}`) : users.find((p) => `${p._id}` === `${resp.referralId}`);
    const registerInfo = report.registerSource === 'performer' ? performers.find((p) => `${p._id}` === `${resp.registerId}`) : users.find((p) => `${p._id}` === `${resp.registerId}`);
    resp.referralInfo = referralInfo ? new UserDto(referralInfo as any).toResponse() : null;
    resp.registerInfo = registerInfo ? new UserDto(registerInfo as any).toResponse() : null;
    return resp;
  }

  public async create(payload: any, request: any) {
    let ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    if (ipAddress.substr(0, 7) === '::ffff:') {
      ipAddress = ipAddress.substr(7);
    }
    const ipInformation = await this.countryService.findCountryByIP(ipAddress);
    const referralCommission = await this.settingService.getKeyValue(SETTING_KEYS.REFERRAL_COMMISSION) || 0.05;
    const data = {
      ...payload,
      commission: referralCommission,
      userAgent: request.headers['user-agent'],
      ipAddress,
      ipInformation,
      updatedAt: new Date(),
      createdAt: new Date()
    };
    return this.referralReportModel.create(data);
  }
}
