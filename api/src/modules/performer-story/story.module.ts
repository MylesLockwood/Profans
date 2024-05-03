import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { AuthModule } from '../auth/auth.module';
import { storyProviders } from './providers';
import { UserModule } from '../user/user.module';
import { StoryFileService, StoryService } from './services';
import { PerformerStoryController, StoryFileController, UserStoryController } from './controllers';
import { ReactionStoryListener, CommentStoryListener } from './listeners';
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
  providers: [...storyProviders,
    StoryService, StoryFileService,
    CommentStoryListener, ReactionStoryListener],
  controllers: [PerformerStoryController, StoryFileController, UserStoryController],
  exports: [...storyProviders, StoryService, StoryFileService]
})
export class PerformerStoryModule { }
