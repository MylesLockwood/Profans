import { Module, forwardRef } from '@nestjs/common';
import { AgendaModule, MongoDBModule, QueueModule } from 'src/kernel';
import { SearchController } from './controllers/search.controller';
import { SearchKeywordService } from './services/search.service';
import { searchProviders } from './providers/search.provider';
import { CreateSearchKeywordListener } from './listeners/create-keyword.listener';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PerformerModule } from '../performer/performer.module';
import { PerformerAssetsModule } from '../performer-assets/performer-assets.module';
import { FeedModule } from '../feed/feed.module';
import { PerformerStoryModule } from '../performer-story/story.module';
import { PerformerBlogModule } from '../performer-blog/blog.module';

@Module({
  imports: [
    QueueModule.forRoot(),
    AgendaModule.register(),
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => PerformerAssetsModule),
    forwardRef(() => FeedModule),
    forwardRef(() => PerformerStoryModule),
    forwardRef(() => PerformerBlogModule)
  ],
  controllers: [SearchController],
  providers: [
    ...searchProviders,
    SearchKeywordService,
    CreateSearchKeywordListener],
  exports: [...searchProviders, SearchKeywordService]
})
export class SearchModule { }
