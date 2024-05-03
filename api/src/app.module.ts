import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SettingModule } from './modules/settings/setting.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { PostModule } from './modules/post/post.module';
import { FileModule } from './modules/file/file.module';
import { PerformerModule } from './modules/performer/performer.module';
import { UtilsModule } from './modules/utils/utils.module';
import { PerformerAssetsModule } from './modules/performer-assets/performer-assets.module';
import { CommentModule } from './modules/comment/comment.module';
import { ReactionModule } from './modules/reaction/reaction.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { BannerModule } from './modules/banner/banner.module';
import { MessageModule } from './modules/message/message.module';
import { SocketModule } from './modules/socket/socket.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { FeedModule } from './modules/feed/feed.module';
import { PerformerStoryModule } from './modules/performer-story/story.module';
import { PerformerBlogModule } from './modules/performer-blog/blog.module';
import { ContactModule } from './modules/contact/contact.module';
import { StreamModule } from './modules/stream/stream.module';
import { SearchModule } from './modules/search/search.module';
import { StatisticsModule } from './modules/statistics/statistic.module';
import { BlockModule } from './modules/block/block.module';
import { ReferralReportModule } from './modules/referral-report/referral-report.module';
import { PayoutRequestModule } from './modules/payout-request/payout.module';

@Module({
  imports: [
    ConfigModule.resolveRootPath(__dirname).load('config/**/!(*.d).{ts,js}'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    AuthModule,
    UserModule,
    PostModule,
    SettingModule,
    MailerModule,
    FileModule,
    UtilsModule,
    PerformerModule,
    PerformerAssetsModule,
    CommentModule,
    ReactionModule,
    PaymentModule,
    SubscriptionModule,
    BannerModule,
    SocketModule,
    MessageModule,
    CouponModule,
    FeedModule,
    PerformerStoryModule,
    PerformerBlogModule,
    StreamModule,
    ContactModule,
    SearchModule,
    StatisticsModule,
    BlockModule,
    ReferralReportModule,
    PayoutRequestModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

export default AppModule;
