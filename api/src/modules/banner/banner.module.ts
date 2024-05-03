import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { AuthModule } from '../auth/auth.module';
import { bannerProviders } from './providers';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { BannerService, BannerSearchService } from './services';
import { AdminBannerController } from './controllers/admin-banner.controller';
import { BannerController } from './controllers/banner.controller';
@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule)
  ],
  providers: [...bannerProviders, BannerService, BannerSearchService],
  controllers: [AdminBannerController, BannerController],
  exports: [BannerService, BannerSearchService]
})
export class BannerModule {}
