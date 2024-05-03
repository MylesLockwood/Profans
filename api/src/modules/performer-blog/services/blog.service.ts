import {
  Injectable, Inject, forwardRef
} from '@nestjs/common';
import { Model } from 'mongoose';
import { PerformerDto } from 'src/modules/performer/dtos';
import {
  EntityNotFoundException,
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { uniq } from 'lodash';
import { PerformerService } from 'src/modules/performer/services';
import { FileService } from 'src/modules/file/services';
import { ReactionService } from 'src/modules/reaction/services/reaction.service';
import { FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import { REACTION_TYPE, REACTION } from 'src/modules/reaction/constants';
import { SEARCH_CHANNEL } from 'src/modules/search/constants';
import * as moment from 'moment';
import { BlogDto } from '../dtos';
import { BlogCreatePayload, BlogSearchRequest } from '../payloads';
import { BlogModel } from '../models';
import { PERFORMER_BLOG_PROVIDER } from '../providers';
import { BLOG_SOURCE, PERFORMER_BLOG_CHANNEL } from '../constants';

@Injectable()
export class BlogService {
  constructor(
    @Inject(PERFORMER_BLOG_PROVIDER)
    private readonly blogModel: Model<BlogModel>,
    private readonly fileService: FileService,
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => ReactionService))
    private readonly reactionService: ReactionService
  ) { }

  public async findById(id) {
    const data = await this.blogModel.findById(id);
    return data;
  }

  private async populateBlogData(blogs: BlogModel[], user: UserDto) {
    const performerIds = uniq(
      blogs.map((f) => f.fromSourceId.toString())
    );
    const blogIds = blogs.map((f) => f._id);
    const fileIds = [];
    blogs.forEach((f) => {
      if (f.fileIds && f.fileIds.length) {
        fileIds.push(...f.fileIds);
      }
    });

    const [performers, files, actions] = await Promise.all([
      this.performerService.findByIds(performerIds),
      this.fileService.findByIds(fileIds),
      user ? this.reactionService.findByQuery({ objectType: REACTION_TYPE.BLOG, objectId: { $in: blogIds }, createdBy: user._id }) : []
    ]);

    return blogs.map((f) => {
      const blog = new BlogDto(f);
      const performer = performers.find((p) => p._id.toString() === f.fromSourceId.toString());
      if (performer) {
        blog.performer = new PerformerDto(performer).toPublicDetailsResponse();
      }
      const like = actions.find((l) => l.objectId.toString() === f._id.toString() && l.action === REACTION.LIKE);
      blog.isLiked = !!like;

      const blogFileStringIds = (f.fileIds || []).map((fileId) => fileId.toString());
      const blogFiles = files.filter((file) => blogFileStringIds.includes(file._id.toString()));
      if (blogFiles.length) {
        blog.files = blogFiles.map((file) => {
          let fileUrl = null;
          fileUrl = file.getUrl();
          return {
            ...file.toResponse(),
            thumbnails: (file.thumbnails || []).map((thumb) => FileDto.getPublicUrl(thumb.path)),
            url: fileUrl
          };
        });
      }
      return blog;
    });
  }

  public async findOne(id, user): Promise<BlogDto> {
    const blog = await this.blogModel.findOne({ _id: id });
    if (!blog) {
      throw new EntityNotFoundException();
    }
    const newblog = await this.populateBlogData([blog], user);
    return new BlogDto(newblog[0]);
  }

  public async createForPerformer(payload: BlogCreatePayload, performer: PerformerDto): Promise<any> {
    // TODO - validate with the blog type?
    const blog = await this.blogModel.create({
      ...payload,
      fromSource: 'performer',
      fromSourceId: performer._id
    } as any);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_BLOG_CHANNEL,
        eventName: EVENT.CREATED,
        data: new BlogDto(blog)
      })
    );
    return blog;
  }

  public async searchBlogs(req: BlogSearchRequest, user: UserDto) {
    const query = {
      fromSource: BLOG_SOURCE.PERFORMER,
      fromSourceId: req.performerId || user._id
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
        { title: searchValue },
        { text: searchValue }
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
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gte: moment(req.fromDate).startOf('date'),
        $lte: moment(req.toDate).endOf('date')
      };
    }
    const [data, total] = await Promise.all([
      this.blogModel
        .find(query)
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.blogModel.countDocuments(query)
    ]);

    // populate video, photo, etc...
    return {
      data: await this.populateBlogData(data as any, user),
      total
    };
  }

  public async updateBlog(id: string, user: UserDto, payload: BlogCreatePayload): Promise<any> {
    const blog = await this.blogModel.findById(id);
    if (!blog || blog.fromSourceId.toString() !== user._id.toString()) throw new EntityNotFoundException();
    const data = { ...payload } as any;
    data.updatedAt = new Date();
    await this.blogModel.updateOne({ _id: id }, data);
    return { updated: true };
  }

  public async deleteBlog(id, user) {
    const blog = await this.blogModel.findOne({ _id: id, fromSourceId: user._id });
    if (!blog) {
      throw new EntityNotFoundException();
    }
    await blog.remove();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_BLOG_CHANNEL,
        eventName: EVENT.DELETED,
        data: new BlogDto(blog)
      })
    );
    return { success: true };
  }
}
