import { MongoDBModule, QueueModule } from 'src/kernel';
import {
  Module, forwardRef, NestModule, MiddlewareConsumer
} from '@nestjs/common';
import { CouponModule } from 'src/modules/coupon/coupon.module';
import { RequestLoggerMiddleware } from 'src/kernel/logger/request-log.middleware';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PerformerModule } from '../performer/performer.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PerformerAssetsModule } from '../performer-assets/performer-assets.module';
import { FeedModule } from '../feed/feed.module';
import { paymentProviders, orderProviders } from './providers';
import { SettingModule } from '../settings/setting.module';
import { MailerModule } from '../mailer/mailer.module';
import { StreamModule } from '../stream/stream.module';
import {
  CCBillService,
  PaymentService,
  CheckPaymentService,
  OrderService,
  PaymentGatewaySettingService,
  BankingSettingService
} from './services';
import {
  PaymentController, OrderController, PaymentWebhookController, PaymentGatewaySettingController, BankingSettingController
} from './controllers';
import { OrderListener } from './listeners';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => SettingModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => PerformerAssetsModule),
    forwardRef(() => CouponModule),
    forwardRef(() => MailerModule),
    forwardRef(() => FeedModule),
    forwardRef(() => StreamModule)
  ],
  providers: [
    ...paymentProviders,
    ...orderProviders,
    PaymentService,
    CCBillService,
    CheckPaymentService,
    PaymentGatewaySettingService,
    BankingSettingService,
    OrderService,
    OrderListener
  ],
  controllers: [
    PaymentController,
    OrderController,
    PaymentWebhookController,
    PaymentGatewaySettingController,
    BankingSettingController
  ],
  exports: [
    ...paymentProviders,
    ...orderProviders,
    PaymentService,
    CCBillService,
    CheckPaymentService,
    PaymentGatewaySettingService,
    BankingSettingService,
    OrderService
  ]
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('/payment/ccbill/callhook');
  }
}
