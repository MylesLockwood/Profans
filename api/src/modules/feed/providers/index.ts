import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { FeedSchema, PollSchema, VoteSchema } from '../schemas';

export const FEED_PROVIDER = 'FEED_PROVIDER';
export const POLL_PROVIDER = 'POLL_PROVIDER';
export const VOTE_PROVIDER = 'VOTE_PROVIDER';

export const feedProviders = [
  {
    provide: FEED_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Feed', FeedSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];

export const pollProviders = [
  {
    provide: POLL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Poll', PollSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];

export const voteProviders = [
  {
    provide: VOTE_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Vote', VoteSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
