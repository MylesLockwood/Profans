import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { AuthModule } from '../auth/auth.module';
import { couponProviders } from './providers';
import { UserModule } from '../user/user.module';
import { CouponService, CouponSearchService } from './services';
import { AdminCouponController } from './controllers/coupon.controller';
import { UpdateCouponUsesListener } from './listeners/coupon-used-listenter';
@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [...couponProviders, CouponService, CouponSearchService, UpdateCouponUsesListener],
  controllers: [AdminCouponController],
  exports: [CouponService, CouponSearchService]
})
export class CouponModule {}
