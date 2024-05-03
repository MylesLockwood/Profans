import { Injectable, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { Model } from 'mongoose';
import { EVENT } from 'src/kernel/constants';
import {
  SEARCH_CHANNEL
} from '../constants';
import { SearchModel } from '../models/search.model';
import { SEARCH_MODEL_PROVIDER } from '../providers/search.provider';

const HANDLE_CREATE_KEYWORD = 'HANDLE_CREATE_KEYWORD';

@Injectable()
export class CreateSearchKeywordListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(SEARCH_MODEL_PROVIDER)
    private readonly searchModel: Model<SearchModel>
  ) {
    this.queueEventService.subscribe(
      SEARCH_CHANNEL,
      HANDLE_CREATE_KEYWORD,
      this.handleCreateKeywordSearch.bind(this)
    );
  }

  public async handleCreateKeywordSearch(event: QueueEvent) {
    const { eventName } = event;
    if (![EVENT.CREATED].includes(eventName)) {
      return;
    }
    const {
      keyword, objectType
    } = event.data;
    const data = await this.searchModel.findOne({ keyword });
    if (data) {
      data.attempt += 1;
      data.updatedAt = new Date();
      if (objectType) { data.objectType = objectType; }
      await data.save();
      return;
    }
    await this.searchModel.create({
      keyword: keyword.split(' ').join('_').toLowerCase(),
      objectType: objectType || null,
      attempt: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
