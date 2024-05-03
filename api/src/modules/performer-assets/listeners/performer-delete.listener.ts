import { Injectable, Inject } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { Model } from 'mongoose';
import { EVENT, STATUS } from 'src/kernel/constants';
import { UserDto } from 'src/modules/user/dtos';
import { DELETE_PERFORMER_CHANNEL } from 'src/modules/performer/constants';
import { ProductModel } from '../models';
import { PERFORMER_PRODUCT_MODEL_PROVIDER } from '../providers';
import { PERFORMER_PRODUCT_CHANNEL } from '../services';

const DELETE_PERFORMER_ASSETS_TOPIC = 'DELETE_PERFORMER_ASSETS_TOPIC';

@Injectable()
export class DeletePerformerAssetsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly productModel: Model<ProductModel>
  ) {
    this.queueEventService.subscribe(
      DELETE_PERFORMER_CHANNEL,
      DELETE_PERFORMER_ASSETS_TOPIC,
      this.handleDeleteData.bind(this)
    );
  }

  private async handleDeleteData(event: QueueEvent): Promise<void> {
    if (event.eventName !== EVENT.DELETED) return;
    const user = event.data as UserDto;
    try {
      const count = await this.productModel.countDocuments({
        performerId: user._id,
        status: STATUS.ACTIVE
      });
      count && await this.productModel.updateMany({
        performerId: user._id
      }, { status: STATUS.INACTIVE });
      count && await this.queueEventService.publish(
        new QueueEvent({
          channel: PERFORMER_PRODUCT_CHANNEL,
          eventName: EVENT.DELETED,
          data: { performerId: user._id, count: -count }
        })
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
