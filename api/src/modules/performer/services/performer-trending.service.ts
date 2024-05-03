/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import {
  Injectable,
  Inject,
  forwardRef
} from '@nestjs/common';
import { Model } from 'mongoose';
import {
  AgendaService, EntityNotFoundException, ForbiddenException
} from 'src/kernel';
import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';
import { PERFORMER_STATUSES, TRENDING_TYPES } from 'src/modules/performer/constants';
import { uniq } from 'lodash';
import * as moment from 'moment';
import { SUBSCRIPTION_STATUS } from 'src/modules/subscription/constants';
import { PerformerTrendingDto } from '../dtos';
import {
} from '../exceptions';
import {
  PerformerTrendingModel, PerformerModel
} from '../models';
import { TrendingProfileCreatePayload } from '../payloads';
import {
  PERFORMER_TRENDING_PROVIDER, PERFORMER_MODEL_PROVIDER
} from '../providers';

const CHECK_AND_UPDATE_TRENDING_PROFILE = 'CHECK_AND_UPDATE_TRENDING_PROFILE';
const CHECK_AND_UPDATE_NEWEST_PROFILE = 'CHECK_AND_UPDATE_NEWEST_PROFILE';

@Injectable()
export class PerformerTrendingService {
  constructor(
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>,
    @Inject(PERFORMER_TRENDING_PROVIDER)
    private readonly performerTrendingModel: Model<PerformerTrendingModel>,
    private readonly agenda: AgendaService
  ) {
    this.defindJobs();
  }

  private async defindJobs() {
    const collection = (this.agenda as any)._collection;
    await collection.deleteMany({
      name: {
        $in: [
          CHECK_AND_UPDATE_TRENDING_PROFILE,
          CHECK_AND_UPDATE_NEWEST_PROFILE
        ]
      }
    });
    this.agenda.define(CHECK_AND_UPDATE_TRENDING_PROFILE, {}, this.checkCreateTrendingProfile.bind(this));
    this.agenda.schedule('24 hours from now', CHECK_AND_UPDATE_TRENDING_PROFILE, {});

    this.agenda.define(CHECK_AND_UPDATE_NEWEST_PROFILE, {}, this.checkCreateNewestProfile.bind(this));
    this.agenda.schedule('24 hours from now', CHECK_AND_UPDATE_NEWEST_PROFILE, {});
  }

  private async checkCreateTrendingProfile(job, done) {
    try {
      // remove all documents
      const data = await this.performerTrendingModel.find({
        listType: TRENDING_TYPES.SUBSCRIPTION
      }).lean();
      const Ids = data.map((d) => d._id);
      await this.performerTrendingModel.deleteMany({
        _id: { $in: Ids },
        isProtected: { $ne: true }
      });
      const newData = await this.performerTrendingModel.find({
        listType: TRENDING_TYPES.SUBSCRIPTION
      }).lean();
      // find 40 performers by subscriptions in 7 days
      const subscriptions = await this.subscriptionService.findAndSort({
        status: SUBSCRIPTION_STATUS.ACTIVE,
        updatedAt: {
          $gte: moment().subtract(7, 'days').startOf('day').toDate()
        }
      }, { updatedAt: -1 });
      const performerIds = uniq(subscriptions.map((s) => s.performerId));
      const performers = await this.performerModel.find({
        _id: { $in: performerIds }, status: PERFORMER_STATUSES.ACTIVE
      }).lean().limit(40);
      await Promise.all(performers.map((per, index) => {
        if (newData.find((p) => `${p.performerId}` === `${per._id}` && p.listType === TRENDING_TYPES.SUBSCRIPTION)) return false;
        const subsNumber = subscriptions.filter((s) => s.performerId === per._id).length || 0;
        this.performerTrendingModel.create({
          performerId: per._id,
          name: per.name,
          firstName: per.firstName,
          lastName: per.lastName,
          username: per.username,
          dateOfBirth: per.dateOfBirth,
          avatarId: per.avatarId,
          avatarPath: per.avatarPath,
          coverId: per.coverId,
          coverPath: per.coverPath,
          welcomeVideoId: per.welcomeVideoId,
          welcomeVideoPath: per.welcomeVideoPath,
          activateWelcomeVideo: per.activateWelcomeVideo,
          verifiedAccount: per.verifiedAccount,
          gender: per.gender,
          country: per.country,
          bio: per.bio,
          createdAt: new Date(),
          updatedAt: new Date(),
          totalSubscribersInDay: subsNumber,
          listType: TRENDING_TYPES.SUBSCRIPTION,
          ordering: index,
          isProtected: false
        });
        return false;
      }));
    } catch (e) {
      console.log('Check & update trending profiles', e);
    } finally {
      job.remove();
      this.agenda.schedule('24 hours from now', CHECK_AND_UPDATE_TRENDING_PROFILE, {});
      typeof done === 'function' && done();
    }
  }

  private async checkCreateNewestProfile(job, done) {
    try {
      // remove all documents
      const data = await this.performerTrendingModel.find({
        listType: TRENDING_TYPES.NEWEST
      }).lean();
      const Ids = data.map((d) => d._id);
      await this.performerTrendingModel.deleteMany({
        _id: { $in: Ids },
        isProtected: { $ne: true }
      });
      const newData = await this.performerTrendingModel.find({
        listType: TRENDING_TYPES.NEWEST
      }).lean();
      // find 40 performers by subscriptions in 30 days
      const performers = await this.performerModel.find({
        status: PERFORMER_STATUSES.ACTIVE,
        verifiedDocument: true
      })
        .lean()
        .limit(40)
        .sort({ createdAt: -1 });

      await Promise.all(performers.map((per, index) => {
        if (newData.find((p) => `${p.performerId}` === `${per._id}` && p.listType === TRENDING_TYPES.NEWEST)) return false;
        this.performerTrendingModel.create({
          performerId: per._id,
          name: per.name,
          firstName: per.firstName,
          lastName: per.lastName,
          username: per.username,
          dateOfBirth: per.dateOfBirth,
          avatarId: per.avatarId,
          avatarPath: per.avatarPath,
          coverId: per.coverId,
          coverPath: per.coverPath,
          welcomeVideoId: per.welcomeVideoId,
          welcomeVideoPath: per.welcomeVideoPath,
          activateWelcomeVideo: per.activateWelcomeVideo,
          verifiedAccount: per.verifiedAccount,
          gender: per.gender,
          country: per.country,
          bio: per.bio,
          createdAt: new Date(),
          updatedAt: new Date(),
          totalSubscribersInDay: 0,
          listType: TRENDING_TYPES.NEWEST,
          ordering: index,
          isProtected: false
        });
        return true;
      }));
    } catch (e) {
      console.log('Check & update newest profiles', e);
    } finally {
      job.remove();
      this.agenda.schedule('24 hours from now', CHECK_AND_UPDATE_NEWEST_PROFILE, {});
      typeof done === 'function' && done();
    }
  }

  public async search(req: { listType: string }) {
    const query = {} as any;
    if (req.listType) {
      query.listType = req.listType;
    }
    const data = await this.performerTrendingModel.find(query).lean().sort({ ordering: 1, updatedAt: -1 });
    return {
      data: data.map((item) => new PerformerTrendingDto(item).toResponse())
    };
  }

  public async randomSearch(req: any): Promise<any> {
    const query = {} as any;
    if (req.listType) {
      query.listType = req.listType;
    }
    if (req.isFreeSubscription) {
      query.isFreeSubscription = req.isFreeSubscription;
    }
    const data = await this.performerTrendingModel.aggregate([
      { $match: query },
      { $sample: { size: 50 } }
    ]);
    return {
      data: data.map((item) => new PerformerTrendingDto(item).toResponse())
    };
  }

  public async create(payload: TrendingProfileCreatePayload) {
    const profile = await this.performerTrendingModel.findOne({
      listType: payload.listType,
      performerId: payload.performerId
    });
    if (profile) throw new ForbiddenException();
    const per = await this.performerModel.findById(payload.performerId);
    if (!per) throw new EntityNotFoundException();
    const ordering = await this.performerTrendingModel.countDocuments({ listType: payload.listType });
    const data = await this.performerTrendingModel.create({
      performerId: per._id,
      name: per.name,
      firstName: per.firstName,
      lastName: per.lastName,
      username: per.username,
      dateOfBirth: per.dateOfBirth,
      avatarId: per.avatarId,
      avatarPath: per.avatarPath,
      coverId: per.coverId,
      coverPath: per.coverPath,
      welcomeVideoId: per.welcomeVideoId,
      welcomeVideoPath: per.welcomeVideoPath,
      activateWelcomeVideo: per.activateWelcomeVideo,
      verifiedAccount: per.verifiedAccount,
      gender: per.gender,
      country: per.country,
      bio: per.bio,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalSubscribersInDay: 0,
      listType: payload.listType,
      ordering: ordering + 1,
      isProtected: true
    });
    return new PerformerTrendingDto(data).toResponse();
  }

  public async update(payload: { ordering: number, performerId: string }) {
    const performer = await this.performerTrendingModel.findById(payload.performerId);
    if (!performer) throw new EntityNotFoundException();
    performer.ordering = payload.ordering || 0;
    await performer.save();
    return new PerformerTrendingDto(performer).toResponse();
  }

  public async delete(id: string) {
    const performer = await this.performerTrendingModel.findById(id);
    if (!performer) throw new EntityNotFoundException();
    await performer.remove();
    return { removed: true };
  }
}
