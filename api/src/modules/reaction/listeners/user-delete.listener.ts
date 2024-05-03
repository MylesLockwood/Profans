import { Injectable, Inject } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { Model } from 'mongoose';
import { EVENT } from 'src/kernel/constants';
import { UserDto } from 'src/modules/user/dtos';
import { DELETE_PERFORMER_CHANNEL } from 'src/modules/performer/constants';
import { FEED_PROVIDER } from 'src/modules/feed/providers';
import { FeedModel } from 'src/modules/feed/models';
import { PERFORMER_PRODUCT_MODEL_PROVIDER } from 'src/modules/performer-assets/providers';
import { ProductModel } from 'src/modules/performer-assets/models';
import { REACT_MODEL_PROVIDER } from '../providers/reaction.provider';
import { ReactionModel } from '../models/reaction.model';

const DELETE_PERFORMER_REACTION_TOPIC = 'DELETE_PERFORMER_REACTION_TOPIC';

@Injectable()
export class DeletePerformerReactionListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(REACT_MODEL_PROVIDER)
    private readonly reactionModel: Model<ReactionModel>,
    @Inject(FEED_PROVIDER)
    private readonly feedModel: Model<FeedModel>,
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly productModel: Model<ProductModel>
  ) {
    this.queueEventService.subscribe(
      DELETE_PERFORMER_CHANNEL,
      DELETE_PERFORMER_REACTION_TOPIC,
      this.handleDeleteData.bind(this)
    );
  }

  private async handleDeleteData(event: QueueEvent): Promise<void> {
    if (event.eventName !== EVENT.DELETED) return;
    const performer = event.data as UserDto;
    try {
      await this.reactionModel.deleteMany({
        objectId: performer._id
      });
      const [feeds, products] = await Promise.all([
        this.feedModel.find({ fromSourceId: performer._id }),
        this.productModel.find({ performerId: performer._id })
      ]);
      feeds.length && await this.reactionModel.deleteMany({
        objectId: { $in: feeds.map((f) => f._id) }
      });
      products.length && await this.reactionModel.deleteMany({
        objectId: { $in: products.map((f) => f._id) }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
