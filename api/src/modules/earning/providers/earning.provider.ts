import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { EarningSchema, ReferralEarningSchema } from '../schemas';

export const EARNING_MODEL_PROVIDER = 'EARNING_MODEL_PROVIDER';
export const REFERRAL_EARNING_MODEL_PROVIDER = 'REFERRAL_EARNING_MODEL_PROVIDER';

export const earningProviders = [
  {
    provide: EARNING_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Earning', EarningSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: REFERRAL_EARNING_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('ReferralEarning', ReferralEarningSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
