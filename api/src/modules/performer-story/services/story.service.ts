import {
  Injectable, Inject, forwardRef
} from '@nestjs/common';
import { Model } from 'mongoose';
import { PerformerDto } from 'src/modules/performer/dtos';
import {
  EntityNotFoundException,
  QueueEventService, QueueEvent
} from 'src/kernel';
import { uniq } from 'lodash';
import { PerformerService } from 'src/modules/performer/services';
import { FileService } from 'src/modules/file/services';
import { ReactionService } from 'src/modules/reaction/services/reaction.service';
import { FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import { EVENT } from 'src/kernel/constants';
import { REACTION_TYPE, REACTION } from 'src/modules/reaction/constants';
import { SEARCH_CHANNEL } from 'src/modules/search/constants';
import * as moment from 'moment';
import { StoryDto } from '../dtos';
import { InvalidStoryTypeException } from '../exceptions';
import { StoryCreatePayload, StorySearchRequest } from '../payloads';
import { StoryModel } from '../models';
import { PERFORMER_STORY_PROVIDER } from '../providers';
import { STORY_SOURCE, STORY_TYPES, PERFORMER_STORY_CHANNEL } from '../constants';

@Injectable()
export class StoryService {
  constructor(
    @Inject(PERFORMER_STORY_PROVIDER)
    private readonly storyModel: Model<StoryModel>,
    private readonly fileService: FileService,
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => ReactionService))
    private readonly reactionService: ReactionService
  ) { }

  public async findById(id) {
    const data = await this.storyModel.findById(id);
    return data;
  }

  public async handleCommentStat(storyId: string, num = 1) {
    await this.storyModel.updateOne({ _id: storyId }, { $inc: { totalComment: num } });
  }

  private async _validatePayload(payload: StoryCreatePayload) {
    if (!STORY_TYPES.includes(payload.type)) {
      throw new InvalidStoryTypeException();
    }
    // TODO - validate for other
  }

  private async populatestoryData(stories: StoryModel[], user: UserDto) {
    const performerIds = uniq(
      stories.map((f) => f.fromSourceId.toString())
    );
    const storyIds = stories.map((f) => f._id);
    const fileIds = [];
    stories.forEach((f) => {
      if (f.fileIds && f.fileIds.length) {
        fileIds.push(...f.fileIds);
      }
    });

    const [performers, files, actions] = await Promise.all([
      this.performerService.findByIds(performerIds),
      this.fileService.findByIds(fileIds),
      user && user._id ? this.reactionService.findByQuery({ objectType: REACTION_TYPE.STORY, objectId: { $in: storyIds }, createdBy: user._id }) : []
    ]);

    return stories.map((f) => {
      const story = new StoryDto(f);
      const performer = performers.find((p) => p._id.toString() === f.fromSourceId.toString());
      if (performer) {
        story.performer = new PerformerDto(performer).toPublicDetailsResponse();
      }
      const like = actions.find((l) => l.objectId.toString() === f._id.toString() && l.action === REACTION.LIKE);
      story.isLiked = !!like;

      const storyFileStringIds = (f.fileIds || []).map((fileId) => fileId.toString());
      const storyFiles = files.filter((file) => storyFileStringIds.includes(file._id.toString()));
      if (storyFiles.length) {
        story.files = storyFiles.map((file) => {
          let fileUrl = null;
          fileUrl = file.getUrl();
          return {
            ...file.toResponse(),
            thumbnails: (file.thumbnails || []).map((thumb) => FileDto.getPublicUrl(thumb.path)),
            url: fileUrl
          };
        });
      }
      return story;
    });
  }

  public async findOne(id, user): Promise<StoryDto> {
    const story = await this.storyModel.findOne({ _id: id });
    if (!story) {
      throw new EntityNotFoundException();
    }
    const newstory = await this.populatestoryData([story], user);
    return new StoryDto(newstory[0]);
  }

  public async createForPerformer(payload: StoryCreatePayload, performer: PerformerDto): Promise<any> {
    // TODO - validate with the story type?
    await this._validatePayload(payload);
    const story = await this.storyModel.create({
      ...payload,
      fromSource: 'performer',
      fromSourceId: performer._id
    } as any);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_STORY_CHANNEL,
        eventName: EVENT.CREATED,
        data: new StoryDto(story)
      })
    );
    return new StoryDto(story);
  }

  public async getPerformerstories(req: StorySearchRequest, user: UserDto) {
    const query = {
      fromSource: STORY_SOURCE.PERFORMER,
      fromSourceId: user._id
    } as any;
    const sort = {
      updatedAt: -1
    };
    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      const searchValue = { $regex: regexp };
      query.$or = [
        { text: searchValue }
      ];
    }
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gte: moment(req.fromDate).startOf('date'),
        $lte: moment(req.toDate).endOf('date')
      };
    }
    const [data, total] = await Promise.all([
      this.storyModel
        .find(query)
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.storyModel.countDocuments(query)
    ]);

    // populate video, photo, etc...
    return {
      data: await this.populatestoryData(data as any, user),
      total
    };
  }

  public async userSearchstories(req: StorySearchRequest, user: UserDto) {
    const query = {
      fromSource: STORY_SOURCE.PERFORMER
    } as any;

    if (req.performerId) {
      query.fromSourceId = req.performerId;
    }
    if (req.q) {
      query.$or = [
        {
          text: { $regex: new RegExp(req.q, 'i') }
        }
      ];
      await this.queueEventService.publish(
        new QueueEvent({
          channel: SEARCH_CHANNEL,
          eventName: EVENT.CREATED,
          data: {
            keyword: req.q,
            fromSource: 'user',
            fromSourceId: user?._id || null
          }
        })
      );
    }
    if (req.ids) {
      query._id = { $in: req.ids };
    }
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gte: moment(req.fromDate).startOf('date'),
        $lte: moment(req.toDate).endOf('date')
      };
    }
    const sort = {
      updatedAt: -1
    };
    const [data, total] = await Promise.all([
      this.storyModel
        .find(query)
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.storyModel.countDocuments(query)
    ]);
    // populate video, photo, etc...
    return {
      data: await this.populatestoryData(data as any, user),
      total
    };
  }

  public async updateStory(id: string, user: UserDto, payload: StoryCreatePayload): Promise<any> {
    const story = await this.storyModel.findById(id);
    if (!story || story.fromSourceId.toString() !== user._id.toString()) throw new EntityNotFoundException();
    const data = { ...payload } as any;
    data.updatedAt = new Date();
    await this.storyModel.updateOne({ _id: id }, data);
    return { updated: true };
  }

  public async deleteStory(id, user) {
    const story = await this.storyModel.findOne({ _id: id, fromSourceId: user._id });
    if (!story) {
      throw new EntityNotFoundException();
    }
    await story.remove();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_STORY_CHANNEL,
        eventName: EVENT.DELETED,
        data: new StoryDto(story)
      })
    );
    return { success: true };
  }
}
