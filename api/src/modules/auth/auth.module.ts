import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { authProviders } from './providers/auth.provider';
import { UserModule } from '../user/user.module';
import { AuthService } from './services';
import { MailerModule } from '../mailer/mailer.module';
import { AuthGuard, RoleGuard, LoadUser } from './guards';
import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { PasswordController } from './controllers/password.controller';
import { PerformerRegisterController } from './controllers/performer-register.controller';
import { FileModule } from '../file/file.module';
import { PerformerModule } from '../performer/performer.module';
import { PerformerLoginController } from './controllers/performer-login.controller';
import { SettingModule } from '../settings/setting.module';
import { ReferralReportModule } from '../referral-report/referral-report.module';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => PerformerModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailerModule),
    forwardRef(() => FileModule),
    forwardRef(() => SettingModule),
    forwardRef(() => ReferralReportModule)
  ],
  providers: [
    ...authProviders,
    AuthService,
    AuthGuard,
    RoleGuard,
    LoadUser
  ],
  controllers: [
    RegisterController,
    LoginController,
    PasswordController,
    PerformerRegisterController,
    PerformerLoginController
  ],
  exports: [
    ...authProviders,
    AuthService,
    AuthGuard,
    RoleGuard,
    LoadUser
  ]
})
export class AuthModule { }
