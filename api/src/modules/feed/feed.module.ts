import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule, AgendaModule } from 'src/kernel';
import { SubscriptionModule } from 'src/modules/subscription/subscription.module';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { AuthModule } from '../auth/auth.module';
import { feedProviders, pollProviders, voteProviders } from './providers';
import { UserModule } from '../user/user.module';
import { FeedFileService, FeedService } from './services';
import { PerformerFeedController, FeedFileController, UserFeedController } from './controllers';
import {
  ReactionFeedListener, CommentFeedListener, PollFeedListener, UpdatePerformerOrientationListener,
  DeletePerformerFeedListener
} from './listeners';
import { FileModule } from '../file/file.module';
import { PerformerModule } from '../performer/performer.module';
import { ReactionModule } from '../reaction/reaction.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    AgendaModule.register(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => ReactionModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [...feedProviders, ...pollProviders, ...voteProviders,
    FeedService, FeedFileService,
    ReactionFeedListener, CommentFeedListener, PollFeedListener, UpdatePerformerOrientationListener, DeletePerformerFeedListener],
  controllers: [PerformerFeedController, FeedFileController, UserFeedController],
  exports: [...feedProviders, FeedService, FeedFileService]
})
export class FeedModule { }
