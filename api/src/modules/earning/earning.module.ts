import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PerformerModule } from '../performer/performer.module';
import { PaymentModule } from '../payment/payment.module';
import { SettingModule } from '../settings/setting.module';
import { EarningController, ReferralEarningController } from './controllers';
import { EarningService, ReferralEarningService } from './services';
import { earningProviders } from './providers/earning.provider';
import { TransactionEarningListener } from './listeners/earning.listener';
import { ReferralReportModule } from '../referral-report/referral-report.module';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => SettingModule),
    forwardRef(() => ReferralReportModule)
  ],
  providers: [...earningProviders, EarningService, ReferralEarningService, TransactionEarningListener],
  controllers: [EarningController, ReferralEarningController],
  exports: [...earningProviders, EarningService, ReferralEarningService, TransactionEarningListener]
})
export class EarningModule {}
