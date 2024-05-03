import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { SearchSchema } from '../schemas/search.schema';

export const SEARCH_MODEL_PROVIDER = 'SEARCH_MODEL_PROVIDER';

export const searchProviders = [
  {
    provide: SEARCH_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('SearchKeyword', SearchSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
