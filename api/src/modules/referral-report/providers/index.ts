import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import {
  ReferralReportSchema
} from '../schemas';

export const REFERRAL_REPORT_PROVIDER = 'REFERRAL_REPORT_PROVIDER';

export const referralReportProviders = [
  {
    provide: REFERRAL_REPORT_PROVIDER,
    useFactory: (connection: Connection) => connection.model('ReferralReports', ReferralReportSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
