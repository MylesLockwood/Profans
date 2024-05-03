import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, AgendaModule } from 'src/kernel';
import { UtilsModule } from 'src/modules/utils/utils.module';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { SettingModule } from '../settings/setting.module';
import { performerProviders } from './providers';
import {
  CategoryService,
  CategorySearchService,
  PerformerService,
  PerformerSearchService,
  PerformerTrendingService
} from './services';
import {
  CategoryController,
  AdminCategoryController,
  AdminPerformerController,
  PerformerController,
  PerformerTrendingController
} from './controllers';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { PerformerAssetsModule } from '../performer-assets/performer-assets.module';
import { ReactionModule } from '../reaction/reaction.module';
import { MailerModule } from '../mailer/mailer.module';
import {
  PerformerAssetsListener, PerformerConnectedListener,
  SubscriptionPerformerListener, UpdatePerformerStatusListener
} from './listeners';
import { BlockModule } from '../block/block.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    MongoDBModule,
    AgendaModule.register(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => PerformerAssetsModule),
    forwardRef(() => UtilsModule),
    forwardRef(() => MailerModule),
    forwardRef(() => SettingModule),
    forwardRef(() => ReactionModule),
    forwardRef(() => BlockModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [
    ...performerProviders,
    CategoryService,
    CategorySearchService,
    PerformerService,
    PerformerSearchService,
    PerformerTrendingService,
    PerformerAssetsListener,
    PerformerConnectedListener,
    SubscriptionPerformerListener,
    UpdatePerformerStatusListener
  ],
  controllers: [
    CategoryController,
    AdminCategoryController,
    AdminPerformerController,
    PerformerController,
    PerformerTrendingController
  ],
  exports: [
    ...performerProviders,
    PerformerService,
    CategoryService,
    PerformerSearchService,
    PerformerTrendingService
  ]
})
export class PerformerModule {}
