import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import {
  PerformerBlockCountrySchema,
  PerformerBlockUserSchema,
  siteBlockCountrySchema
} from '../schemas';

export const PERFORMER_BLOCK_COUNTRY_PROVIDER = 'PERFORMER_BLOCK_COUNTRY_PROVIDER';
export const PERFORMER_BLOCK_USER_PROVIDER = 'PERFORMER_BLOCK_USER_PROVIDER';
export const SITE_BLOCK_COUNTRY_PROVIDER = 'SITE_BLOCK_COUNTRY_PROVIDER';

export const blockProviders = [
  {
    provide: PERFORMER_BLOCK_COUNTRY_PROVIDER,
    useFactory: (connection: Connection) => connection.model(
      'PerformerBlockCountries',
      PerformerBlockCountrySchema
    ),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: PERFORMER_BLOCK_USER_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerBlockUsers', PerformerBlockUserSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: SITE_BLOCK_COUNTRY_PROVIDER,
    useFactory: (connection: Connection) => connection.model('SiteBlockCountry', siteBlockCountrySchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
