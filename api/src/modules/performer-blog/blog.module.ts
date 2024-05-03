import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { AuthModule } from '../auth/auth.module';
import { blogProviders } from './providers';
import { UserModule } from '../user/user.module';
import { BlogFileService, BlogService } from './services';
import { PerformerBlogController, StoryFileController, UserBlogController } from './controllers';
import { FileModule } from '../file/file.module';
import { PerformerModule } from '../performer/performer.module';
import { ReactionModule } from '../reaction/reaction.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => ReactionModule)
  ],
  providers: [...blogProviders,
    BlogService, BlogFileService
  ],
  controllers: [PerformerBlogController, StoryFileController, UserBlogController],
  exports: [...blogProviders, BlogFileService, BlogService]
})
export class PerformerBlogModule { }
