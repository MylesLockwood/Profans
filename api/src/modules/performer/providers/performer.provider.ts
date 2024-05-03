import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import {
  CategorySchema,
  PerformerSchema,
  CommissionSettingSchema,
  PerformerTrendingSchema
} from '../schemas';

export const PERFORMER_MODEL_PROVIDER = 'PERFORMER_MODEL';
export const PERFORMER_CATEGORY_MODEL_PROVIDER = 'PERFORMER_CATEGORY_MODEL';
export const PERFORMER_COMMISSION_SETTING_MODEL_PROVIDER = 'PERFORMER_COMMISSION_SETTING_MODEL_PROVIDER';
export const PERFORMER_TRENDING_PROVIDER = 'PERFORMER_TRENDING_PROVIDER';

export const performerProviders = [
  {
    provide: PERFORMER_CATEGORY_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerCategory', CategorySchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: PERFORMER_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Performer', PerformerSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: PERFORMER_COMMISSION_SETTING_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerCommissionSetting', CommissionSettingSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: PERFORMER_TRENDING_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerTrending', PerformerTrendingSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
