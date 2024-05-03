import { Injectable, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import {
  PERFORMER_PHOTO_CHANNEL,
  PERFORMER_PRODUCT_CHANNEL,
  PERFORMER_COUNT_VIDEO_CHANNEL
} from 'src/modules/performer-assets/services';
import { Model } from 'mongoose';
import { PHOTO_STATUS, VIDEO_STATUS, PRODUCT_STATUS } from 'src/modules/performer-assets/constants';
import { EVENT } from 'src/kernel/constants';
import { FeedDto } from 'src/modules/feed/dtos';
import { PERFORMER_FEED_CHANNEL } from 'src/modules/feed/constants';
import { PERFORMER_BLOG_CHANNEL } from 'src/modules/performer-blog/constants';
import { PERFORMER_STORY_CHANNEL } from 'src/modules/performer-story/constants';
import { PerformerModel } from '../models';
import { PERFORMER_MODEL_PROVIDER } from '../providers';

const HANDLE_PHOTO_COUNT_FOR_PERFORMER = 'HANDLE_PHOTO_COUNT_FOR_PERFORMER';
const HANDLE_VIDEO_COUNT_FOR_PERFORMER = 'HANDLE_VIDEO_COUNT_FOR_PERFORMER';
const HANDLE_PRODUCT_COUNT_FOR_PERFORMER = 'HANDLE_PRODUCT_COUNT_FOR_PERFORMER';
const HANDLE_FEED_COUNT_FOR_PERFORMER = 'HANDLE_FEED_COUNT_FOR_PERFORMER';
const HANDLE_BLOG_COUNT_FOR_PERFORMER = 'HANDLE_BLOG_COUNT_FOR_PERFORMER';
const HANDLE_STORY_COUNT_FOR_PERFORMER = 'HANDLE_STORY_COUNT_FOR_PERFORMER';

@Injectable()
export class PerformerAssetsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>
  ) {
    this.queueEventService.subscribe(
      PERFORMER_COUNT_VIDEO_CHANNEL,
      HANDLE_VIDEO_COUNT_FOR_PERFORMER,
      this.handleVideoCount.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_PHOTO_CHANNEL,
      HANDLE_PHOTO_COUNT_FOR_PERFORMER,
      this.handlePhotoCount.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_PRODUCT_CHANNEL,
      HANDLE_PRODUCT_COUNT_FOR_PERFORMER,
      this.handleProductCount.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_FEED_CHANNEL,
      HANDLE_FEED_COUNT_FOR_PERFORMER,
      this.handleFeedCount.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_BLOG_CHANNEL,
      HANDLE_BLOG_COUNT_FOR_PERFORMER,
      this.handleBlogCount.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_STORY_CHANNEL,
      HANDLE_STORY_COUNT_FOR_PERFORMER,
      this.handleStoryCount.bind(this)
    );
  }

  public async handlePhotoCount(event: QueueEvent) {
    const { eventName } = event;
    if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
      return;
    }
    const { performerId, status, oldStatus } = event.data;
    let increase = 0;

    switch (eventName) {
      case EVENT.CREATED:
        if (status === PHOTO_STATUS.ACTIVE) increase = 1;
        break;
      case EVENT.UPDATED:
        if (
          oldStatus !== PHOTO_STATUS.ACTIVE
            && status === PHOTO_STATUS.ACTIVE
        ) increase = 1;
        if (
          oldStatus === PHOTO_STATUS.ACTIVE
            && status !== PHOTO_STATUS.ACTIVE
        ) increase = -1;
        break;
      case EVENT.DELETED:
        if (status === PHOTO_STATUS.ACTIVE) increase = -1;
        break;
      default:
        break;
    }

    if (increase) {
      await this.performerModel.updateOne(
        { _id: performerId },
        {
          $inc: {
            'stats.totalPhotos': increase
          }
        }
      );
    }
  }

  public async handleVideoCount(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
        return false;
      }
      const { performerId, status, oldStatus } = event.data;
      let increase = 0;

      switch (eventName) {
        case EVENT.CREATED:
          if (status === VIDEO_STATUS.ACTIVE) increase = 1;
          break;
        case EVENT.UPDATED:
          if (
            oldStatus !== VIDEO_STATUS.ACTIVE
            && status === VIDEO_STATUS.ACTIVE
          ) increase = 1;
          if (
            oldStatus === VIDEO_STATUS.ACTIVE
            && status !== VIDEO_STATUS.ACTIVE
          ) increase = -1;
          break;
        case EVENT.DELETED:
          if (status === VIDEO_STATUS.ACTIVE) increase = -1;
          break;
        default:
          break;
      }
      if (increase) {
        await this.performerModel.updateOne(
          { _id: performerId },
          {
            $inc: {
              'stats.totalVideos': increase
            }
          }
        );
      }
      return true;
    } catch (e) {
      // TODO - log me
      // console.log(e);
      return false;
    }
  }

  public async handleProductCount(event: QueueEvent) {
    const { eventName } = event;
    if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
      return;
    }
    const {
      performerId, status, oldStatus, count
    } = event.data;
    if (count) {
      await this.performerModel.updateOne(
        { _id: performerId },
        {
          $inc: {
            'stats.totalProducts': count
          }
        }
      );
      return;
    }
    let increase = 0;

    switch (eventName) {
      case EVENT.CREATED:
        if (status === PRODUCT_STATUS.ACTIVE) increase = 1;
        break;
      case EVENT.UPDATED:
        if (
          oldStatus !== PRODUCT_STATUS.ACTIVE
            && status === PRODUCT_STATUS.ACTIVE
        ) increase = 1;
        if (
          oldStatus === PRODUCT_STATUS.ACTIVE
            && status !== PRODUCT_STATUS.ACTIVE
        ) increase = -1;
        break;
      case EVENT.DELETED:
        if (status === PRODUCT_STATUS.ACTIVE) increase = -1;
        break;
      default:
        break;
    }
    if (increase) {
      await this.performerModel.updateOne(
        { _id: performerId },
        {
          $inc: {
            'stats.totalProducts': increase
          }
        }
      );
    }
  }

  public async handleFeedCount(event: QueueEvent) {
    const { eventName } = event;
    if (![EVENT.CREATED, EVENT.DELETED].includes(eventName)) {
      return;
    }
    const { fromSourceId, count } = event.data;
    if (count) {
      await this.performerModel.updateOne(
        { _id: fromSourceId },
        {
          $inc: {
            'stats.totalFeeds': count
          }
        }
      );
      return;
    }
    let increase = 0;

    switch (eventName) {
      case EVENT.CREATED:
        increase = 1;
        break;
      case EVENT.DELETED:
        increase = -1;
        break;
      default:
        break;
    }
    if (increase) {
      await this.performerModel.updateOne(
        { _id: fromSourceId },
        {
          $inc: {
            'stats.totalFeeds': increase
          }
        }
      );
    }
  }

  public async handleBlogCount(event: QueueEvent) {
    const { eventName } = event;
    if (![EVENT.CREATED, EVENT.DELETED].includes(eventName)) {
      return;
    }
    const { fromSourceId } = event.data as FeedDto;
    let increase = 0;

    switch (eventName) {
      case EVENT.CREATED:
        increase = 1;
        break;
      case EVENT.DELETED:
        increase = -1;
        break;
      default:
        break;
    }
    if (increase) {
      await this.performerModel.updateOne(
        { _id: fromSourceId },
        {
          $inc: {
            'stats.totalBlogs': increase
          }
        }
      );
    }
  }

  public async handleStoryCount(event: QueueEvent) {
    const { eventName } = event;
    if (![EVENT.CREATED, EVENT.DELETED].includes(eventName)) {
      return;
    }
    const { fromSourceId } = event.data as FeedDto;
    let increase = 0;

    switch (eventName) {
      case EVENT.CREATED:
        increase = 1;
        break;
      case EVENT.DELETED:
        increase = -1;
        break;
      default:
        break;
    }
    if (increase) {
      await this.performerModel.updateOne(
        { _id: fromSourceId },
        {
          $inc: {
            'stats.totalStories': increase
          }
        }
      );
    }
  }
}
