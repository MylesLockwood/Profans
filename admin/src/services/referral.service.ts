import { APIRequest } from './api-request';

export class ReferralService extends APIRequest {
  referralEarningList(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/referral-earnings/admin/search', query)
    );
  }

  referralEarningStats(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/referral-earnings/admin/stats', query)
    );
  }

  referralReportList(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/referral-reports/admin/search', query)
    );
  }
}

export const referralService = new ReferralService();
