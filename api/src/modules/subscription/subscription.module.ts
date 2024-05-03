import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { SubscriptionController } from './controllers/subscription.controller';
import { CancelSubscriptionController } from './controllers/cancel-subscription.controller';
import { SubscriptionService } from './services/subscription.service';
import { subscriptionProviders } from './providers/subscription.provider';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PerformerModule } from '../performer/performer.module';
import { OrderSubscriptionListener, DeleteUserCommentListener } from './listeners';
import { CancelSubscriptionService } from './services/cancel-subscription.service';
import { SettingModule } from '../settings/setting.module';
import { MailerModule } from '../mailer/mailer.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    QueueModule.forRoot(),
    MongoDBModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => SettingModule),
    forwardRef(() => MailerModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [...subscriptionProviders,
    SubscriptionService,
    CancelSubscriptionService,
    OrderSubscriptionListener,
    DeleteUserCommentListener],
  controllers: [SubscriptionController, CancelSubscriptionController],
  exports: [...subscriptionProviders, SubscriptionService, CancelSubscriptionService]
})
export class SubscriptionModule {}
