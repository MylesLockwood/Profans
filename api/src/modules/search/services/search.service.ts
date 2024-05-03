import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  AgendaService, PageableData, QueueEvent, QueueEventService
} from 'src/kernel';
import { EVENT, STATUS } from 'src/kernel/constants';
import { PERFORMER_MODEL_PROVIDER } from 'src/modules/performer/providers';
import { PerformerModel } from 'src/modules/performer/models';
import { PERFORMER_PRODUCT_MODEL_PROVIDER } from 'src/modules/performer-assets/providers';
import { ProductModel } from 'src/modules/performer-assets/models';
import { FEED_PROVIDER } from 'src/modules/feed/providers';
import { FeedModel } from 'src/modules/feed/models';
import { PERFORMER_STORY_PROVIDER } from 'src/modules/performer-story/providers';
import { StoryModel } from 'src/modules/performer-story/models';
import { BlogModel } from 'src/modules/performer-blog/models';
import { PERFORMER_BLOG_PROVIDER } from 'src/modules/performer-blog/providers';
import * as moment from 'moment';
import { SearchDto } from '../dtos/search.dto';
import { UserDto } from '../../user/dtos';
import {
  SearchRequestPayload, SearchCreatePayload
} from '../payloads';
import { SEARCH_MODEL_PROVIDER } from '../providers/search.provider';
import { SearchModel } from '../models/search.model';
import { SEARCH_CHANNEL } from '../constants';

const REMOVE_KEYWORD_AGENDA = 'REMOVE_KEYWORD_AGENDA';

@Injectable()
export class SearchKeywordService {
  constructor(
    @Inject(SEARCH_MODEL_PROVIDER)
    private readonly searchModel: Model<SearchModel>,
    private readonly queueEventService: QueueEventService,
    private readonly agenda: AgendaService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>,
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    @Inject(FEED_PROVIDER)
    private readonly feedModel: Model<FeedModel>,
    @Inject(PERFORMER_STORY_PROVIDER)
    private readonly storyModel: Model<StoryModel>,
    @Inject(PERFORMER_BLOG_PROVIDER)
    private readonly blogModel: Model<BlogModel>
  ) {
    this.defindJobs();
  }

  private async defindJobs() {
    const collection = (this.agenda as any)._collection;
    await collection.deleteMany({
      name: {
        $in: [
          REMOVE_KEYWORD_AGENDA
        ]
      }
    });
    this.agenda.define(REMOVE_KEYWORD_AGENDA, {}, this.removeKeywordAgenda.bind(this));
    this.agenda.schedule('1 hour from now', REMOVE_KEYWORD_AGENDA, {});
  }

  private async removeKeywordAgenda(job: any, done: any): Promise<void> {
    try {
      const items = await this.searchModel.find({
        createdAt: { $lte: moment().subtract(30, 'days').startOf('day').toDate() }
      });
      const Ids = items.map((i) => i._id);
      await this.searchModel.deleteMany({ _id: { $in: Ids } });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('remove search keywords error', e);
    } finally {
      job.remove();
      this.agenda.schedule('1 hour from now', REMOVE_KEYWORD_AGENDA, {});
      typeof done === 'function' && done();
    }
  }

  public async countTotalBySource(
    req: SearchCreatePayload,
    user: UserDto
  ) {
    const queryPerformer = { } as any;
    const queryStory = { } as any;
    const queryBlog = { } as any;
    const queryProduct = { } as any;
    const queryFeed = { } as any;
    if (req.keyword) {
      const regexp = new RegExp(
        req.keyword.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      const searchValue = { $regex: regexp };
      queryPerformer.$and = [{
        $or: [
          { name: searchValue },
          { username: searchValue }
        ]
      }, { status: STATUS.ACTIVE, verifiedDocument: true }];

      queryProduct.$and = [{
        $or: [
          {
            name: { $regex: regexp }
          },
          {
            description: { $regex: regexp }
          }
        ]
      }, { status: STATUS.ACTIVE }];

      queryFeed.$and = [{
        $or: [
          {
            text: { $regex: regexp }
          },
          {
            tagline: { $regex: regexp }
          }
        ]
      }, { status: STATUS.ACTIVE }];

      queryStory.$and = [{
        $or: [
          {
            text: { $regex: regexp }
          }
        ]
      }];

      queryBlog.$and = [{
        $or: [
          {
            title: { $regex: regexp }
          },
          {
            text: { $regex: regexp }
          }
        ]
      }];
    }
    const [totalPerformer, totalProduct, totalFeed, totalStory, totalBlog] = await Promise.all([
      this.performerModel.countDocuments(queryPerformer),
      this.productModel.countDocuments(queryProduct),
      this.feedModel.countDocuments(queryFeed),
      this.storyModel.countDocuments(queryStory),
      this.blogModel.countDocuments(queryBlog)
    ]);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: SEARCH_CHANNEL,
        eventName: EVENT.CREATED,
        data: {
          keyword: req.keyword,
          fromSource: 'user',
          fromSourceId: user?._id || null
        }
      })
    );
    return {
      totalPerformer,
      totalProduct,
      totalFeed,
      totalStory,
      totalBlog
    };
  }

  public async getSearchKeywords(
    req: SearchRequestPayload
  ): Promise<PageableData<SearchDto>> {
    const query = {} as any;
    const sort = {
      attempt: -1,
      updatedAt: -1
    };
    if (req.dateRange) {
      switch (req.dateRange) {
        case 'day': query.updatedAt = {
          $gte: moment().subtract(1, 'days').startOf('day').toDate()
        };
          break;
        case 'week': query.updatedAt = {
          $gte: moment().subtract(7, 'days').startOf('day').toDate()
        };
          break;
        case 'month': query.updatedAt = {
          $gte: moment().subtract(30, 'days').startOf('day').toDate()
        };
          break;
        default: break;
      }
    }
    const [data, total] = await Promise.all([
      this.searchModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.searchModel.countDocuments(query)
    ]);
    const reactions = data.map((d) => new SearchDto(d));

    return {
      data: reactions,
      total
    };
  }
}
