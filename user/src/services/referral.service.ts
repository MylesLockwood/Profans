import { APIRequest } from './api-request';

export class ReferralService extends APIRequest {
  referralEarningList(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/referral-earnings/user/search', query)
    );
  }

  referralEarningStats(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/referral-earnings/user/stats', query)
    );
  }

  referralReportList(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/referral-reports/user/search', query)
    );
  }
}

export const referralService = new ReferralService();
