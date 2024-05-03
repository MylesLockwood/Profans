import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { StorySchema } from '../schemas';

export const PERFORMER_STORY_PROVIDER = 'PERFORMER_STORY_PROVIDER';

export const storyProviders = [
  {
    provide: PERFORMER_STORY_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerStory', StorySchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
