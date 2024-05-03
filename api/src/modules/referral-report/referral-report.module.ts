import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { UtilsModule } from 'src/modules/utils/utils.module';
import { AuthModule } from '../auth/auth.module';
import { referralReportProviders } from './providers';
import {
  ReferralReportService
} from './services';
import {
  ReferralReportController
} from './controllers';
import { UserModule } from '../user/user.module';
import { PerformerModule } from '../performer/performer.module';
import { SettingModule } from '../settings/setting.module';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => UserModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UtilsModule),
    forwardRef(() => SettingModule)
  ],
  providers: [
    ...referralReportProviders,
    ReferralReportService
  ],
  controllers: [
    ReferralReportController
  ],
  exports: [
    ...referralReportProviders,
    ReferralReportService
  ]
})
export class ReferralReportModule {}
