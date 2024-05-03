import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { BlogSchema } from '../schemas';

export const PERFORMER_BLOG_PROVIDER = 'PERFORMER_BLOG_PROVIDER';

export const blogProviders = [
  {
    provide: PERFORMER_BLOG_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerBlog', BlogSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
